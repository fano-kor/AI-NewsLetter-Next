import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function processJsonlContent(content: string): Promise<number> {
  console.log(content);
  const lines = content.split('\n');
  let processedCount = 0;
  let errorCount = 0;

  for (const line of lines) {
    if (line.trim()) {
      try {
        const newsData = JSON.parse(line);
        await prisma.news.create({
          data: {
            title: newsData.title,
            content: newsData.content,
            summary: newsData.summary,
            url: newsData.url,
            source: newsData.source,
            author: newsData.author,
            published_at: new Date(newsData.published_at),
            keywords: newsData.keywords,
            crawled_at: new Date()
          }
        });
        processedCount++;
      } catch (error) {
        console.error('뉴스 항목 처리 오류:', error);
        console.error('문제가 있는 라인:', line);
        errorCount++;
      }
    }
  }

  console.log(`처리 완료: ${processedCount}개 성공, ${errorCount}개 실패`);
  return processedCount;
}
