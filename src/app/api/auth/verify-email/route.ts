import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 400 });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: '잘못된 인증 코드입니다.' }, { status: 400 });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json({ error: '인증 코드가 만료되었습니다.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json({ message: '이메일이 성공적으로 인증되었습니다.' });
  } catch (error) {
    console.error('이메일 인증 오류:', error);
    return NextResponse.json({ error: '이메일 인증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
