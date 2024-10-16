import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';  // getUser 함수를 import 합니다.

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const DEFAULT_AI_PROMPT = process.env.DEFAULT_AI_PROMPT;

export async function POST(request: Request) {
  try {
    const { news } = await request.json();
    const newsString = JSON.stringify(news);
    //console.log('뉴스 데이터:', news);
    // 현재 사용자의 정보를 가져옵니다.
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자의 aiPrompt를 가져옵니다. 없으면 환경 변수의 기본 프롬프트를 사용합니다.
    const prompt = user.aiPrompt || DEFAULT_AI_PROMPT || "당신은 여러 출처의 중요한 뉴스를 요약하도록 설계된 AI입니다. JSONArray 형식으로 뉴스 기사가 제공되며, 이를 읽고 주요 뉴스를 추출하여 간결한 뉴스 브리핑을 작성하는 것이 당신의 역할입니다.";
    console.log('AI 프롬프트:', prompt);
    // 뉴스 내용을 하나의 문자열로 결합
    //const newsContent = news.map((item: any) => item.content).join("\n\n");

    const endpoint = "https://api.perplexity.ai/chat/completions";
    const headers = {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json"
    };
    
    const data = {
      //"model": "llama-3.1-70b-instruct",
      //"model": "llama-3.1-sonar-small-128k-online",
      "model": "llama-3.1-sonar-large-128k-online",
      "messages": [
        {"role": "system", "content": prompt},
        {"role": "user", "content": newsString}
      ],
      "temperature": 0.2,
      "top_p": 0.9
    };

    //console.log('API 요청 데이터:', JSON.stringify(data, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('API 요청 실패:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('에러 응답 본문:', errorBody);
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();
    console.log('API 응답:', JSON.stringify(result, null, 2));

    if ('choices' in result && result.choices.length > 0) {
      return NextResponse.json({ summary: result.choices[0].message.content });
    } else {
      throw new Error("API 응답에 예상된 데이터가 없습니다.");
    }

  } catch (error) {
    console.error('뉴스 요약 중 오류 발생:', error);
    return NextResponse.json({ error: '뉴스 요약 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
