import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';  // Prisma 클라이언트 인스턴스를 가져옵니다.

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const data = await request.json();
    const { name, interestKeywords, aiPrompt, emailScheduleDays, emailScheduleTime, isSubscribed } = data;

    user.aiPrompt = user.aiPrompt === "" ? process.env.DEFAULT_AI_PROMPT ?? null : user.aiPrompt;

    // 사용자 정보 업데이트
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        name,
        interestKeywords,
        aiPrompt,
        emailScheduleDays,
        emailScheduleTime,
        isSubscribed,
      },
    });

    return NextResponse.json({ 
      message: '설정이 저장되었습니다.',
      user: {
        name: updatedUser.name,
        interestKeywords: updatedUser.interestKeywords,
        aiPrompt: updatedUser.aiPrompt,
        emailScheduleDays: updatedUser.emailScheduleDays,
        emailScheduleTime: updatedUser.emailScheduleTime,
        isSubscribed: updatedUser.isSubscribed,
      }
    });
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
