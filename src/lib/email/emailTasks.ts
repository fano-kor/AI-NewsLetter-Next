'use server';

import prisma from '@/lib/prisma';
import cron from 'node-cron';
import { createDailySummary } from '@/lib/ai/news-summarizer';
import { marked } from 'marked';
import { sendEmail } from '@/lib/emailer';

export async function sendEmailToUser(user: any) {
  try {
    const today = new Date();
    today.setHours(6, 0, 0, 0);  // 오늘 07시

    const summaries = await prisma.dailySummary.findMany({
      where: {
        tag: {
          in: user.interestTags
        },
        date: today
      },
      select: {
        tag: true,
        summary: true,
      },
      orderBy: {
        date: 'desc'
      },
      distinct: ['tag']
    });

    // user.interestTags의 순서에 맞게 결과를 정렬
    const orderedSummaries = user.interestTags.map((tag: string) => 
      summaries.find(summary => summary.tag === tag)
    ).filter((summary: String) => summary !== undefined);

    if (orderedSummaries.length === 0) {
      throw new Error('해당 키워드의 요약이 없습니다.');
    }

    // 키워드별 요약을 마크다운 형식으로 구성
    const markdownContent = orderedSummaries.map((item: { tag: string; summary: string }) => `
## ${item.tag} 뉴스
${item.summary}
    `).join('\n\n');

    // 마크다운을 HTML로 변환
    const htmlContent = marked(markdownContent);

    // 이메일 스타일 추가
    const styledHtmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px; }
            a { color: #3498db; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
    const subject = "오늘의 AI 뉴스 큐레이션";
    // 이메일 전송
    await sendEmail(user.email, subject, styledHtmlContent);

    // 이메일 큐에 기록
    await prisma.emailQueue.create({
      data: {
        recipient: user.email,
        subject: subject,
        body: styledHtmlContent,
        status: 'SENT',
        sentAt: new Date()
      }
    });

    return true;
  } catch (error) {
    console.error('이메일 발송 중 오류:', error);
    throw error;
  }
}

// sendEmails 함수 수정
export async function sendEmails() {
  const today = new Date();
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()];

  const users = await prisma.users.findMany({
    where: {
      isSubscribed: true,
      emailScheduleDays: {
        has: dayOfWeek
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      interestTags: true,
      emailScheduleTime: true
    }
  });

  console.log(`발송 대상 사용자 수: ${users.length}`);

  for (const user of users) {
    try {
      await sendEmailToUser(user);
      console.log(`이메일 발송 성공: ${user.email}`);
    } catch (error) {
      console.error(`이메일 발송 실패 (${user.email}):`, error);
    }
  }
}

let isSchedulerInitialized = false;
// 환경 변수에서 크론 스케줄 가져오기
//const NEWS_SUMMARY_CRON = process.env.NEWS_SUMMARY_CRON || '*/5 * * * *';
//const EMAIL_SEND_CRON = process.env.EMAIL_SEND_CRON || '*/5 * * * *';
const SUMMARIZE_NEWS_CRON = process.env.SUMMARIZE_NEWS_CRON || '0 7 * * *';
const SEND_MAIL_CRON = process.env.SEND_MAIL_CRON || '0 8 * * *';

export async function initializeScheduler() {
  if (isSchedulerInitialized) {
    console.log('스케줄러가 이미 초기화되었습니다.');
    return;
  }

  // 뉴스 요약 및 이메일 저장 크론 작업 설정 
  cron.schedule(SUMMARIZE_NEWS_CRON, async () => {
    console.log(`뉴스 요약 및 이메일 저장 실행 : ${SUMMARIZE_NEWS_CRON}`);
    try {
      await createDailySummary(new Date());
      console.log('뉴스 요약 및 이메일 저장이 완료되었습니다.');
    } catch (error) {
      console.error('뉴스 요약 및 이메일 저장 중 오류 발생:', error);
    }
  });

  // 이메일 발송 크론 작업 설정
  cron.schedule(SEND_MAIL_CRON, async () => {  
    //console.log(`이메일 발송 실행 : ${EMAIL_SEND_CRON}`);
    try {
      await sendEmails();
      //console.log('이메일 발송이 완료되었습니다.');
    } catch (error) {
      console.error('이메일 발송 중 오류 발생:', error);
    }
  });

  isSchedulerInitialized = true;
  console.log('스케줄러가 초기화되었습니다.');
}
