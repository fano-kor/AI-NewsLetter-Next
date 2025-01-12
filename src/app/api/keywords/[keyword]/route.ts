import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { keyword: string } }
) {
    try {
        const { keyword } = params;
        await prisma.keywords.delete({
            where: { keyword }
        });
        return NextResponse.json({ message: '키워드가 삭제되었습니다.' });
    } catch (error) {
        console.error('키워드 삭제 중 오류 발생:', error);
        return NextResponse.json({ error: '키워드 삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

