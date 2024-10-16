import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, code, password, name } = await req.json();

    // 입력값 유효성 검사
    if (!email || !code || !password || !name) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    return await prisma.$transaction(async (tx) => {
      const verification = await tx.emailVerification.findUnique({ where: { email } });

      if (!verification) {
        return NextResponse.json({ error: '인증 정보를 찾을 수 없습니다.' }, { status: 400 });
      }

      if (verification.code !== code) {
        return NextResponse.json({ error: '잘못된 인증 코드입니다.' }, { status: 400 });
      }

      if (verification.expiresAt < new Date()) {
        return NextResponse.json({ error: '인증 코드가 만료되었습니다.' }, { status: 400 });
      }

      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자 생성
      await tx.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          aiPrompt: process.env.DEFAULT_AI_PROMPT ?? null,
          // 다른 필요한 필드들...
        },
      });

      // 인증 정보 삭제
      await tx.emailVerification.delete({ where: { email } });

      return NextResponse.json({ message: '이메일이 성공적으로 인증되었습니다.' });
    });

  } catch (error) {
    console.error('이메일 인증 오류:', error);
    return NextResponse.json({ error: '이메일 인증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
