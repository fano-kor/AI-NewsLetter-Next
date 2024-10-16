import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { subHours } from 'date-fns';
import { marked } from 'marked';
import { sendEmail } from '@/lib/emailer';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const DEFAULT_AI_PROMPT = process.env.DEFAULT_AI_PROMPT;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const articles = await prisma.news.findMany({
      select: {
        title: true,
        content: true,
        publishedAt: true,
        keywords: true,
      },
      where: {
        keywords: {
          hasSome: user.interestKeywords
        },
        publishedAt: {
          gte: subHours(new Date(), 24)
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 50
    });

    const newsString = JSON.stringify(articles);
    const prompt = user.aiPrompt || DEFAULT_AI_PROMPT || "당신은 여러 출처의 중요한 뉴스를 요약하도록 설계된 AI입니다. JSONArray 형식으로 뉴스 기사가 제공되며, 이를 읽고 주요 뉴스를 추출하여 간결한 뉴스 브리핑을 작성하는 것이 당신의 역할입니다. 마크다운 형식으로 응답해주세요.";

    const endpoint = "https://api.perplexity.ai/chat/completions";
    const headers = {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    const data = {
      "model": "llama-3.1-sonar-huge-128k-online",
      "messages": [
        {"role": "system", "content": prompt},
        {"role": "user", "content": newsString}
      ],
      "temperature": 0.2,
      "top_p": 0.9
    }; 

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    const summary = result.choices[0].message.content;

    // 마크다운을 HTML로 변환
    const htmlContent = marked(summary);

    // 이메일 스타일 추가
    const styledHtmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h1, h2, h3 { color: #2c3e50; }
            a { color: #3498db; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // 이메일 전송 로직
    await sendEmail(user.email, "BC AI 뉴스 브리핑", styledHtmlContent);

    return NextResponse.json({ message: '메일이 성공적으로 발송되었습니다.' });
  } catch (error) {
    console.error('메일 발송 중 오류 발생:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
