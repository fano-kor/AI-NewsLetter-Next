import { NextResponse } from 'next/server';
import { startEmailScheduler } from '@/lib/emailScheduler';

export async function GET() {
  startEmailScheduler();
  return NextResponse.json({ message: 'Mail scheduler started' });
}

