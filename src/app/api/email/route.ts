import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sendEmailToUser } from '@/lib/email/emailTasks';

export async function POST(request: Request) {
  try {
    console.log('## POST /api/email');
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    await sendEmailToUser(user);
    return NextResponse.json({ message: '메일이 성공적으로 발송되었습니다.' });
  } catch (error) {
    console.error('메일 발송 중 오류 발생:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
