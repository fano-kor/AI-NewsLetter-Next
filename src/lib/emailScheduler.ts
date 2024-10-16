import cron from 'node-cron';
import { scheduleEmails, sendScheduledEmails } from '@/app/api/scheduler/email/service';

export function startEmailScheduler() {
  // 매 15분마다 이메일 스케줄링
  cron.schedule('*/15 * * * *', async () => {
    console.log('이메일 스케줄링 실행');
    await scheduleEmails();
  });

  // 매 분마다 예약된 이메일 발송
  cron.schedule('* * * * *', async () => {
    console.log('예약된 이메일 발송 실행');
    await sendScheduledEmails();
  });
}
