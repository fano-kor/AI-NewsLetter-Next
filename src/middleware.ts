import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenValid } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  console.log('middleware');
  const { pathname } = request.nextUrl;
  
  // 토큰 검증이 필요 없는 경로들
  const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/register'];
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 외부 API 경로에 대한 처리는 제외 (자체 인증 로직 사용)
  if (pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  // 내부 API 및 웹 페이지에 대한 처리
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isValid = await isTokenValid(token);
  if (!isValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname == '/') {
    return NextResponse.redirect(new URL('/keyword-news', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
