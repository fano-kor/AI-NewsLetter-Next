import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenValid } from '@/lib/tokenVerifier';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 퍼블릭 경로는 검증 제외
  const publicPaths = [
    '/login', 
    '/signup', 
    '/api/auth/login', 
    '/api/auth/register',
    '/api/public'
  ];
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  if (!token) {
    // API 요청인 경우 401 응답
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' }, 
        { status: 401 }
      );
    }
    // 페이지 요청인 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 토큰 유효성 검증
  const isValid = await isTokenValid(token);
  if (!isValid) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' }, 
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 루트 경로 리다이렉트
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/keyword-news', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일과 특정 API 경로 제외
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
