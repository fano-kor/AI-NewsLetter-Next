import { NextResponse } from 'next/server';
import { scheduleEmails, sendScheduledEmails } from '@/app/api/scheduler/email/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'schedule') {
      await scheduleEmails();
      return NextResponse.json({ message: '이메일 스케줄링이 완료되었습니다.' });
    } else if (action === 'send') {
      await sendScheduledEmails();
      return NextResponse.json({ message: '예약된 이메일 발송이 완료되었습니다.' });
    } else {
      return NextResponse.json({ error: '잘못된 액션입니다.' }, { status: 400 });
    }
  } catch (error) {
    console.error('이메일 처리 중 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

