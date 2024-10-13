import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    // 코드가 없으면 초기화 코드 생성 및 전송
    if (!code) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: '해당 이메일로 등록된 사용자가 없습니다.' }, { status: 400 });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresMinutes = 3;
      const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000); // 10분 후 만료

      await prisma.passwordReset.upsert({
        where: { email },
        update: { code: resetCode, expiresAt },
        create: { email, code: resetCode, expiresAt },
      });

      // 이메일 전송 로직
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: '"AI-NewsLetter" <noreply@ainewsletter.com>',
        to: email,
        subject: "비밀번호 초기화",
        text: `귀하의 비밀번호 초기화 코드는 ${resetCode}입니다. 이 코드는 ${expiresMinutes}분간 유효합니다.`,
        html: `<b>귀하의 비밀번호 초기화 코드는 ${resetCode}입니다. 이 코드는 ${expiresMinutes}분간 유효합니다.</b>`,
      });

      return NextResponse.json({ message: '비밀번호 초기화 코드가 이메일로 전송되었습니다.' });
    } else {
      // 코드 확인 및 비밀번호 재설정
      const resetRequest = await prisma.passwordReset.findUnique({ where: { email } });
      if (!resetRequest || resetRequest.code !== code || resetRequest.expiresAt < new Date()) {
        return NextResponse.json({ error: '유효하지 않거나 만료된 코드입니다.' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      await prisma.passwordReset.delete({ where: { email } });

      return NextResponse.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
    }
  } catch (error) {
    console.error('비밀번호 초기화 오류:', error);
    return NextResponse.json({ error: '비밀번호 초기화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

