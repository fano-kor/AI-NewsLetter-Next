import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    const token = generateToken(user.userId);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('로그인 오류:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: '로그인 중 알 수 없는 오류가 발생했습니다.' }, { status: 500 });
  }
}