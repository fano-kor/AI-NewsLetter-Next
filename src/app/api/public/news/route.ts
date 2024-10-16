import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('news.jsonl') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const fileContent = await file.text();
    const lines = fileContent.split('\n');

    let createdCount = 0;
    let updatedCount = 0;

    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const article = JSON.parse(line);
      
      console.log("##########################");
      console.log(article);
      console.log("##########################");

      // base64 문자열을 바이트 배열로 변환
      let thumbnailImageBytes = null;
      if (article.thumbnail_image) {
        thumbnailImageBytes = Buffer.from(article.thumbnail_image, 'base64');
      }

      const existingArticle = await prisma.news.findUnique({
        where: { url: article.url } as Prisma.NewsWhereUniqueInput,
      });

      if (existingArticle) {
        // 기존 기사가 존재하면 키워드 업데이트
        const updatedKeywords = Array.from(new Set([...existingArticle.keywords, ...article.keywords]));
        await prisma.news.update({
          where: { url: article.url },
          data: {
            title: article.title,
            content: article.content,
            publishedAt: new Date(article.published_at),
            keywords: updatedKeywords,
            thumbnailImage: thumbnailImageBytes
          },
        });
        updatedCount++;
      } else {
        // 새로운 기사면 생성
        await prisma.news.create({
          data: {
            title: article.title,
            content: article.content,
            publishedAt: new Date(article.published_at),
            url: article.url,
            keywords: article.keywords,
            thumbnailImage: thumbnailImageBytes
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      message: `${createdCount}개의 새 기사가 저장되었고, ${updatedCount}개의 기사가 업데이트되었습니다.`
    });
  } catch (error) {
    console.error('뉴스 데이터 처리 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  }
}
