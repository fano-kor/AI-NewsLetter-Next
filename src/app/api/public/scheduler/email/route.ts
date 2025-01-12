import { NextResponse } from 'next/server';

import { initializeScheduler } from '@/lib/email/emailTasks';

export async function POST(request: Request) {
  initializeScheduler();
  return NextResponse.json({ message: '스케줄러 초기화가 완료되었습니다.' });
}
