import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getNewsWithoutSummary } from '@/lib/ai/news-summarizer';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // JSON 배열을 직접 파싱
    const newsArray = await request.json();

    if (!Array.isArray(newsArray)) {
      return NextResponse.json({ error: '유효하지 않은 데이터 형식입니다.' }, { status: 400 });
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const article of newsArray) {
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
        const existingKeywords = existingArticle.keywords ?? [];
        const existingTags = existingArticle.tags ?? [];
        console.log("existingKeywords: %o", existingKeywords);
        console.log("existingTags: %o", existingTags);
        const updatedKeywords = Array.from(new Set([...existingKeywords, ...(article.keywords || [])]));
        console.log("updatedKeywords: %o", updatedKeywords);
        const updatedTags = Array.from(new Set([...existingTags, ...(article.tags || [])]));
        console.log("updatedTags: %o", updatedTags);
        await prisma.news.update({
          where: { url: article.url },
          data: {
            title: article.title,
            content: article.content,
            publishedAt: new Date(article.published_at),
            keywords: updatedKeywords,
            thumbnailImage: thumbnailImageBytes,
            tags: updatedTags
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
            thumbnailImage: thumbnailImageBytes,
            tags: article.tags,
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
