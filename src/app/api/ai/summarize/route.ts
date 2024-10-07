import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { news } = body;

    // 프롬프트 추가
    const prompt = "다음은 여러 개의 뉴스 기사입니다. 이 기사들을 종합하여 핵심 내용을 간략하게 요약해주세요:\n\n";

    // 뉴스 내용을 하나의 문자열로 결합
    const newsContent = news.map((item: any) => item.content).join("\n\n");

    // 프롬프트와 뉴스 내용을 결합
    const fullContent = prompt + newsContent;

    // 결합된 내용을 UTF-8 인코딩된 바이트 배열로 변환
    const contentBytes = new TextEncoder().encode(fullContent);

    // AI-NewsLetter-AIHandler API 호출
    const response = await axios.post(process.env.AI_HANDLER_URL + "/api/summarize", contentBytes, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });

    // 응답 로깅
    console.log('AI 요약 API 응답:', JSON.stringify(response.data, null, 2));

    return NextResponse.json({ 
      summary: response.data.summary,
      fullResponse: response.data  // 전체 응답 데이터 포함
    });
  } catch (error) {
    console.error('AI 뉴스 요약 중 오류 발생:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('에러 응답:', error.response.data);
      return NextResponse.json({ 
        error: 'AI 뉴스 요약 중 오류가 발생했습니다.', 
        details: error.response.data 
      }, { status: error.response.status });
    }
    return NextResponse.json({ error: 'AI 뉴스 요약 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
