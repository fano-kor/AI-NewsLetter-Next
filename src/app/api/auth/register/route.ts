import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email.endsWith('@bccard.com')) {
      return NextResponse.json({ error: '유효하지 않은 이메일 주소입니다.' }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: '이미 존재하는 이메일 주소입니다.' }, { status: 400 });
    }

    const existingVerification = await prisma.emailVerification.findUnique({ where: { email } });
    if (existingVerification) {
      await prisma.emailVerification.delete({ where: { email } });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분 후 만료

    await prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt,
      },
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
      subject: "이메일 인증",
      text: `귀하의 인증 코드는 ${code}입니다. 이 코드는 3분간 유효합니다.`,
      html: `<b>귀하의 인증 코드는 ${code}입니다. 이 코드는 3분간 유효합니다.</b>`,
    });

    return NextResponse.json({ message: '인증 코드가 이메일로 전송되었습니다.' });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다. 관리자에게 문의하세요.' }, { status: 500 });
  }
}
