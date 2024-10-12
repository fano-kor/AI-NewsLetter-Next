import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email.endsWith('@bccard.com')) {
      return NextResponse.json({ error: '유효하지 않은 이메일 주소입니다.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 3 * 60 * 1000); // 3분 후 만료

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCode,
        verificationExpires,
      },
    });

    // 이메일 전송 로직
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"AI-NewsLetter" <noreply@ainewsletter.com>',
      to: email,
      subject: "이메일 인증",
      text: `귀하의 인증 코드는 ${verificationCode}입니다. 이 코드는 3분간 유효합니다.`,
      html: `<b>귀하의 인증 코드는 ${verificationCode}입니다. 이 코드는 3분간 유효합니다.</b>`,
    });

    return NextResponse.json({ message: '사용자가 생성되었습니다. 이메일을 확인해 주세요.' });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 });
  }
}