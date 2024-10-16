import { PrismaClient, EmailStatus } from '@prisma/client';
import { sendEmail, generateEmailContent } from '@/app/api/scheduler/email/utils';

const prisma = new PrismaClient();

export async function scheduleEmails() {
  const now = new Date();
  const targetTime = new Date(now.getTime() + 15 * 60 * 1000);
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][targetTime.getDay()];
  const timeString = targetTime.toTimeString().slice(0, 5);

  const usersToSchedule = await prisma.users.findMany({
    where: {
      isSubscribed: true,
      emailScheduleDays: {
        has: dayOfWeek
      },
      emailScheduleTime: timeString
    }
  });

  for (const user of usersToSchedule) {
    await prisma.emailQueue.create({
      data: {
        recipient: user.email,
        subject: "오늘의 뉴스 업데이트",
        body: await generateEmailContent(user),
        status: EmailStatus.PENDING
      }
    });
  }

  console.log(`${usersToSchedule.length}명의 사용자에 대해 이메일이 예약되었습니다.`);
}

export async function sendScheduledEmails() {
  const emailsToSend = await prisma.emailQueue.findMany({
    where: {
      status: EmailStatus.PENDING,
      createdAt: {
        lte: new Date()
      }
    }
  });

  for (const email of emailsToSend) {
    try {
      await sendEmail(email.recipient, email.subject, email.body);
      
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { 
          status: EmailStatus.SENT,
          sentAt: new Date()
        }
      });

      console.log(`이메일 발송 성공: ${email.recipient}`);
    } catch (error) {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { 
          status: EmailStatus.FAILED,
          failureReason: error instanceof Error ? error.message : '알 수 없는 오류'
        }
      });

      console.error(`이메일 발송 실패: ${email.recipient}, 사유: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
}
