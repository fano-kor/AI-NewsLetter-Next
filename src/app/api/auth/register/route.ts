import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/emailer';

// 인증 코드 만료 시간 설정 (분 단위)
const CODE_EXPIRATION_MINUTES = 3;

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email.endsWith('@bccard.com')) {
      return NextResponse.json({ error: '유효하지 않은 이메일 주소입니다.' }, { status: 400 });
    }

    return await prisma.$transaction(async (tx) => {
      // 이메일 중복 확인
      const existingUser = await tx.users.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: '이미 존재하는 이메일 주소입니다.' }, { status: 400 });
      }

      // 기존 인증 정보 삭제
      await tx.emailVerification.deleteMany({ where: { email } });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);

      // 새 인증 정보 생성
      await tx.emailVerification.upsert({
        where: { email },
        update: { code, expiresAt },
        create: { email, code, expiresAt },
      });

      // 이메일 전송 로직
      const subject = "이메일 인증";
      const content = `
        <html>
          <body>
            <p>귀하의 인증 코드는 <b>${code}</b>입니다.</p>
            <p>이 코드는 ${CODE_EXPIRATION_MINUTES}분간 유효합니다.</p>
          </body>
        </html>
      `;

      try {
        await sendEmail(email, subject, content);
      } catch (emailError) {
        console.error('이메일 전송 오류:', emailError);
        throw new Error('이메일 전송에 실패했습니다.');
      }

      return NextResponse.json({ message: '인증 코드가 이메일로 전송되었습니다.' });
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다. 관리자에게 문의하세요.' }, { status: 500 });
  }
}
