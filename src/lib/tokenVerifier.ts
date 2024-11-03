import * as jose from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'default_secret_key_for_development'
);

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
