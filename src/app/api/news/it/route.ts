import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: {
        keywords: {
          has: 'IT'
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 20
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching IT news:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

