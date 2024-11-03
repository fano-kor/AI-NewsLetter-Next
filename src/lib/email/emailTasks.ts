'use server';

import prisma from '@/lib/prisma';
import cron from 'node-cron';
import { createDailySummary } from '@/lib/ai/news-summarizer';
import { sendEmail } from '@/lib/emailer';

export async function sendEmailsFromQueue() {
  const emailsToSend = await prisma.emailQueue.findMany({
    where: {
      status: 'PENDING'
    },
    take: 50 // 한 번에 최대 50개의 이메일 처리
  });

  for (const email of emailsToSend) {
    try {
      await sendEmail(email.recipient, email.subject, email.body);
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'SENT', sentAt: new Date() }
      });
    } catch (error) {
      console.error('메일 발송 중 오류 발생:', error);
      console.error('에러 스택 트레이스:', error instanceof Error ? error.stack : '스택 트레이스를 사용할 수 없습니다.');
      
      let failureReason = '알 수 없는 오류';
      if (error instanceof Error) {
        failureReason = `${error.name}: ${error.message}\n${error.stack}`;
      }

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { 
          status: 'FAILED', 
          failureReason: failureReason
        }
      });
    }
  }
}

let isSchedulerInitialized = false;
// 환경 변수에서 크론 스케줄 가져오기
//const NEWS_SUMMARY_CRON = process.env.NEWS_SUMMARY_CRON || '*/5 * * * *';
//const EMAIL_SEND_CRON = process.env.EMAIL_SEND_CRON || '*/5 * * * *';
const SUMMARIZE_NEWS_CRON = process.env.SUMMARIZE_NEWS_CRON || '0 6 * * *';
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
      await sendEmailsFromQueue();
      //console.log('이메일 발송이 완료되었습니다.');
    } catch (error) {
      console.error('이메일 발송 중 오류 발생:', error);
    }
  });

  isSchedulerInitialized = true;
  console.log('스케줄러가 초기화되었습니다.');
}
