import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/emailer';

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    // 코드가 없으면 초기화 코드 생성 및 전송
    if (!code) {
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: '해당 이메일로 등록된 사용자가 없습니다.' }, { status: 400 });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresMinutes = 3;
      const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

      await prisma.$transaction(async (tx) => {
        await tx.passwordReset.upsert({
          where: { email },
          update: { code: resetCode, expiresAt },
          create: { email, code: resetCode, expiresAt },
        });
      });

      // 이메일 전송 로직
      const subject = "비밀번호 초기화";
      const content = `
        <html>
          <body>
            <p>귀하의 비밀번호 초기화 코드는 <b>${resetCode}</b>입니다.</p>
            <p>이 코드는 ${expiresMinutes}분간 유효합니다.</p>
          </body>
        </html>
      `;

      await sendEmail(email, subject, content);

      return NextResponse.json({ message: '비밀번호 초기화 코드가 이메일로 전송되었습니다.' });
    } else {
      // 코드 확인 및 비밀번호 재설정
      return await prisma.$transaction(async (tx) => {
        const resetRequest = await tx.passwordReset.findUnique({ where: { email } });
        if (!resetRequest || resetRequest.code !== code || resetRequest.expiresAt < new Date()) {
          return NextResponse.json({ error: '유효하지 않거나 만료된 코드입니다.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await tx.users.update({
          where: { email },
          data: { password: hashedPassword },
        });

        await tx.passwordReset.delete({ where: { email } });

        return NextResponse.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
      });
    }
  } catch (error) {
    console.error('비밀번호 초기화 오류:', error);
    return NextResponse.json({ error: '비밀번호 초기화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
