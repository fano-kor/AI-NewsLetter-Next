import { NextResponse } from 'next/server';
import { startEmailScheduler } from '@/lib/emailScheduler';

let isInitialized = false;

export async function GET() {
  if (!isInitialized) {
    startEmailScheduler();
    isInitialized = true;
    return NextResponse.json({ message: '스케줄러가 초기화되었습니다.' });
  }
  return NextResponse.json({ message: '스케줄러가 이미 실행 중입니다.' });
}

