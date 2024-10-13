import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
  // 세션 쿠키 제거
  cookieStore.delete('session');
  
  // 다른 인증 관련 쿠키들도 제거
  cookieStore.delete('token');
  
  // 필요한 경우 데이터베이스에서 세션 정보 삭제
  // await prisma.session.delete({ where: { ... } });

  return NextResponse.json({ message: '로그아웃 되었습니다.' }, { status: 200 });
}

