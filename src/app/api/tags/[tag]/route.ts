import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function DELETE(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {

    const tagName = decodeURIComponent(params.tag);

    await prisma.tags.delete({
      where: {
        tag: tagName,
      },
    });

    return NextResponse.json({ message: '태그가 삭제되었습니다.' });
  } catch (error) {
    console.error('태그 삭제 중 오류 발생:', error);
    return NextResponse.json({ error: '태그 삭제에 실패했습니다.' }, { status: 500 });
  }
}
