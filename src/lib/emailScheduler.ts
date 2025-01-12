import { runEmailWorker } from './workerManager';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startEmailScheduler() {
  if (schedulerInterval) {
    console.log('스케줄러가 이미 실행 중입니다.');
    return;
  }

  schedulerInterval = setInterval(async () => {
    const now = new Date();
    const minutes = now.getMinutes();

    if (minutes % 15 === 0) {
      console.log('이메일 스케줄링 실행');
      await runEmailWorker('schedule');
    }

    console.log('예약된 이메일 발송 실행');
    await runEmailWorker('send');
  }, 60 * 1000); // 매 1분마다 실행

  console.log('이메일 스케줄러가 시작되었습니다.');
}

export function stopEmailScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('이메일 스케줄러가 중지되었습니다.');
  }
}
