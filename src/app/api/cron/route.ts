import { NextResponse } from 'next/server';
import { startMailScheduler } from '@/lib/mailScheduler';

export async function GET() {
  startMailScheduler();
  return NextResponse.json({ message: 'Mail scheduler started' });
}

