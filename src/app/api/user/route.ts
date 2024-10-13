import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ error: '인증되지 않음' }, { status: 401 });
  }

  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없음' }, { status: 404 });
  }

  return NextResponse.json(user);
}

