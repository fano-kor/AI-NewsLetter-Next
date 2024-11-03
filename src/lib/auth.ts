import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/lib/prisma';  // 전역 Prisma 인스턴스 import

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'default_secret_key_for_development'
);

export async function verifyPassword(email: string, password: string): Promise<{ userId: string } | null> {
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return { userId: user.id };
  } catch (error) {
    console.error('비밀번호 검증 오류:', error);
    return null;
  }
}

export async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jose.jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    })
    return true
  } catch (error) {
    console.error('토큰 검증 오류:', error)
    return false
  }
}

export async function generateToken(userId: string): Promise<string> {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY가 설정되지 않았습니다.');
  }

  return await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET_KEY);
    return { userId: payload.userId as string };
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return null;
  }
}

// 비밀번호 해시화 함수 (회원가입 시 사용)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function getUser() {
  const token = cookies().get('token')?.value;
  
  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return null;
  }

  try {
    const user = await prisma.users.findUnique({ 
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        aiPrompt: true,
        interestKeywords: true,
        emailScheduleDays: true,
        emailScheduleTime: true,
        isSubscribed: true,
      }
    });
    if (!user) {
      return null;
    }

    user.aiPrompt = user.aiPrompt === "" ? process.env.DEFAULT_AI_PROMPT ?? null : user.aiPrompt;

    console.log(user.aiPrompt);

    return user;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
}

// 로그아웃 함수 추가
export async function logout() {
  try {
    cookies().delete('token');
    return true;
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    return false;
  }
}
