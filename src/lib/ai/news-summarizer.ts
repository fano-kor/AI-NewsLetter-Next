'use server';

import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
// import { startOfDay } from 'date-fns';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const DEFAULT_AI_PROMPT = process.env.DEFAULT_AI_PROMPT;

async function callApi(prompt: string, newsString: string) {
  const endpoint = "https://api.perplexity.ai/chat/completions";
  const headers = {
    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    "Content-Type": "application/json"
  };

  const data = {
    //"model": "llama-3.1-sonar-large-128k-online",
    "model": "llama-3.1-sonar-large-128k-chat",
    //"model": "llama-3.1-70b-instruct",
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
    console.error('API 요청 실패:', response.status, response.statusText);
    const errorBody = await response.text();
    console.error('에러 응답 본문:', errorBody);
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  const result = await response.json();
  console.log('result: ', result);
  if ('choices' in result && result.choices.length > 0) {
    return result.choices[0].message.content;
  } else {
    throw new Error("API 응답에 예상된 데이터가 없습니다.");
  }
}

export async function makeLetter(news: any[]) {
  try {
    const newsString = JSON.stringify(news);
    
    const user = await getUser();
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const prompt = (user.aiPrompt ?? DEFAULT_AI_PROMPT) ?? "당신은 여러 출처의 중요한 뉴스를 요약하도록 설계된 AI입니다. JSONArray 형식으로 뉴스 기사가 제공되며, 이를 읽고 주요 뉴스를 추출하여 간결한 뉴스 브리핑을 작성하는 것이 당신의 역할입니다.";
    console.log('AI 프롬프트:', prompt);

    const content = await callApi(prompt, newsString);
    return content;

  } catch (error) {
    console.error('뉴스 요약 중 오류 발생:', error);
    throw new Error('뉴스 요약 중 오류가 발생했습니다.');
  }
}

export async function summarizeNews(news: any[]) {
  try {
    const newsString = JSON.stringify(news);
    
    const prompt = `당신은 AI뉴스 요약서비스 입니다. 사용자들에게 뉴스를 요약하여 제공하도록 설계된 AI입니다.
    JSON 형식으로 뉴스 기사가 제공되며, 이를 읽고 핵심 내용을 요약하는 것이 당신의 역할입니다.
    응답은 한글로 해주세요. 응답 그대로 JSON 파싱이 가능하도록 다음과 같이 json 형태로만 답해주세요.
    {"summary": "{요약}"}`;
    console.log('AI 프롬프트:', prompt);

    const content = await callApi(prompt, newsString);
    return parseJsonString(content).summary;

  } catch (error) {
    console.error('뉴스 요약 중 오류 발생:', error);
    throw new Error('뉴스 요약 중 오류가 발생했습니다.');
  }
}

export async function tagNews(news: any[]) {
  try {
    const newsString = JSON.stringify(news);
    
    const prompt = `당신은 뉴스의 태그를 분류하도록 설계된 AI입니다.
    JSON 형식으로 뉴스 기사가 제공되며, 이를 읽고 적절한 태그를 분류하는 것이 당신의 역할입니다.
    태그는 다음 중 하나로 선택해 주세요: [경제, 신용카드 업계, 정치, IT, 사회, 국제, AI, 생활/문화, 스포츠]
    반드시 부가적인 설명은 하지 말아주세요. markdown 응답이 아닌. 응답 그대로 JSON 파싱이 가능하도록 json 형태로만 답해주세요.
    반드시 json 형태로만 답해주세요.
    {"tags": [분류1, 분류2]}`;
    console.log('AI 프롬프트:', prompt);

    const content = await callApi(prompt, newsString);
    const tags = parseJsonString(content).tags;
    console.log("tags: " + tags);
    return tags;

  } catch (error) {
    console.error('뉴스 요약 중 오류 발생:', error);
    throw new Error('뉴스 태그 분류 중 오류가 발생했습니다.');
  }
}

export async function getNewsWithoutSummary() {
  try {
    // 요약이 없는 뉴스 항목을 조회합니다.
    const newsWithoutSummary = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        url: true
      },
      where: {
        summary: null
      }
    });
    return newsWithoutSummary;
  } catch (error) {
    console.error('요약이 없는 뉴스 조회 중 오류 발생:', error);
    throw new Error('요약이 없는 뉴스 조회 중 오류가 발생했습니다.');
  }
}

async function getNewsWithoutTags() {
  try {
    // 태그가 없는 뉴스 항목을 조회합니다.
    const newsWithoutTags = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        content: true
      },
      where: {
        tags: {
          equals: null // 빈 배열과 비교하여 태그가 없는 뉴스 항목을 조회
        }
      }
    });
    return newsWithoutTags;
  } catch (error) {
    console.error('태그가 없는 뉴스 조회 중 오류 발생:', error);
    throw new Error('태그가 없는 뉴스 조회 중 오류가 발생했습니다.');
  }
}

export async function summarizeNewsWithoutSummary() {
  try {
    const newsWithoutSummary = await getNewsWithoutSummary();

    for (const news of newsWithoutSummary) {
      try {
        const summary = await summarizeNews([news]);

        await prisma.news.update({
          where: { id: news.id },
          data: {
            summary
          }
        });
      } catch (error) {
        console.error('뉴스 요약 중 오류 발생:', error);
        throw new Error('뉴스 요약 중 오류가 발생했습니다.');
      }
    }
  } catch (error) {
    console.error('요약이 없는 뉴스 조회 중 오류 발생:', error);
    throw new Error('요약이 없는 뉴스 조회 중 오류가 발생했습니다.');
  }
}

export async function tagNewsWithoutTags() {
  try {
    const newsWithoutTags = await getNewsWithoutTags();

    for (const news of newsWithoutTags) {
      try {
        const tags  = await tagNews([news]);
        console.log("tags: " + tags);

        await prisma.news.update({
          where: { id: news.id },
          data: {
            tags
          }
        });
      } catch (error) {
        console.error('뉴스 태그 분류 중 오류 발생:', error);
        throw new Error('뉴스 태그 분류 중 오류가 발생했습니다.');
      }
    }
  } catch (error) {
    console.error('태그가 없는 뉴스 조회 중 오류 발생:', error);
    throw new Error('태그가 없는 뉴스 조회 중 오류가 발생했습니다.');
  }
}

function parseJsonString(content: string): any {
  try {
    // JSON 파싱에 문제가 될 수 있는 문자를 치환
    const sanitizedContent = content
      .replace(/\n/g, ' ')  // 개행 문자를 공백으로 치환
      .replace(/\t/g, ' ')  // 탭 문자를 공백으로 치환
      .replace(/\\'/g, "'") // 이스케이프된 작은따옴표를 일반 작은따옴표로 치환
      .replace(/\\"/g, '"') // 이스케이프된 큰따옴표를 일반 큰따옴표로 치환

    const startIndex = sanitizedContent.indexOf('{');
    const endIndex = sanitizedContent.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = sanitizedContent.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonString);
    } else {
      throw new Error("JSON 포맷을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    return null;
  }
}

export async function createAllDailySummary(date: Date) {
  try {
    // 해당 일자의 뉴스를 태그별로 그룹화하여 가져옵니다
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - 1)
    startOfDay.setHours(6, 0, 0, 0);
    //const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const endOfDay = new Date()

    const tags = await prisma.tags.findMany();
    //const keywords = [{"keyword":"경제"}]

    for (const { tag } of tags) {
      summarizeTag(tag, startOfDay, endOfDay)
    }

    console.log(`${date.toLocaleDateString()} 일간 요약 생성 완료`);
  } catch (error) {
    console.error('일간 요약 생성 중 오류 발생:', error);
    throw new Error('일간 요약 생성 중 오류가 발생했습니다.');
  }
}

export async function createDailySummary(date: Date) {
  try {
    // 해당 일자의 뉴스를 태그별로 그룹화하여 가져옵니다
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - 1);
    startOfDay.setHours(6, 0, 0, 0);
    const endOfDay = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 오늘자 일간 요약이 없는 태그를 조회합니다
    const tags = await prisma.tags.findMany();

    for (const { tag } of tags) {
      const existingSummary = await prisma.dailySummary.findFirst({
        where: {
          date: {
            gte: todayStart, // 오늘 시작 시간 이상
            lte: todayEnd,   // 오늘 종료 시간 이하
          },
          tag: tag,
        },
        select: {
          date: true,
          tag: true
        },
      });
      
      if (!existingSummary) {
        await summarizeTag(tag, startOfDay, endOfDay); // 요약이 없는 경우에만 요약 생성
      }
    }

    console.log(`${date.toLocaleDateString()} 일간 요약 생성 완료`);
  } catch (error) {
    console.error('일간 요약 생성 중 오류 발생:', error);
    throw new Error('일간 요약 생성 중 오류가 발생했습니다.');
  }
}

export async function createTagSummary(tag:string) {
  try {
    // 해당 일자의 뉴스를 키워드별로 그룹화하여 가져옵니다
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - 1)
    startOfDay.setHours(6, 0, 0, 0);
    //const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const endOfDay = new Date()

    summarizeTag(tag, startOfDay, endOfDay)
    
    console.log(`${endOfDay.toLocaleDateString()} 일간 요약 생성 완료`);
  } catch (error) {
    console.error('일간 요약 생성 중 오류 발생:', error);
    throw new Error('일간 요약 생성 중 오류가 발생했습니다.');
  }
}

async function summarizeTag(tag:string, startOfDay:Date, endOfDay:Date){
  
  // 해당 키워드와 일자의 뉴스를 조회
  const news = await prisma.news.findMany({
    where: {
      AND: [
        { tags: { has: tag } },
        {
          publishedAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      ]
    },
    select: {
      title: true,
      content: true,
      url: true
    }
  });

  if (news.length === 0) return false;

  console.log("## news.length", news.length)

  try {
    const newsString = JSON.stringify(news);

    let prompt: string = ``;  
    if(["KT", "비씨카드", "스마트로", "케이뱅크"].includes(tag)) {
      prompt = `비씨카드 사내 뉴스 요약 서비스 입니다. 비씨카드 사내 뉴스를 요약하는 것이 당신의 역할입니다
      비씨카드 그룹사
      모회사:KT
      자회사:스마트로, 케이뱅크
      `
    }
    
    // AI를 사용하여 일간 요약 생성
    prompt += `##입력 데이터 형식:
{
  "title": "뉴스 제목",
  "content": "뉴스 본문",
  "url": "뉴스 URL"
}
##뉴스 선별 규칙:
- 제공된 ${news.length}개의 뉴스를 3-5개의 핵심 주제로 선별
- 핵심 주제 별 기사 요약

##요약 규칙:
- 한국어로 작성
- 각 주제는 이모지(➖)로 시작
- 제목과 내용은 '...'으로 구분하고 제목은 굵게 작성
- 핵심 수치는 반드시 포함하고 굵게 표시하거나 따옴표로 강조
- 뉴스 내용에 적합한 이모지를 내용 내에 추가
- 전체 길이는 200자 이내로 제한
- '%', '억원', '만원' 등의 수치는 반드시 포함
- 증감을 나타내는 수치에는 방향 이모지 추가 (예: 5%⬆️ 3%⬇️) 
- **반드시 한국어로 작성, 한국어가 아닌 언어로 작성된 경우 한국어로 수정**
- 각 요약 마지막에 원본 뉴스 링크 추가 **🔗[[Link]]({url})**

##이모지 사용 가이드:
- 경제/금융: 📈 📉 💹 💰 💲 
- 산업/제조: 🏭 🔧 ⚙️ 🚗
- 에너지/환경: ⚡ 🔋 ☢️ 🌱
- 무역/수출: 🚢 ✈️ 📦 🌐
- 증감/변화: ⬆️ ⬇️ ↗️ ↘️
- 위험/주의: ⚠️ 🚨 ❗
- 긍정/호재: 📈 💪 ⭐
- 부정/악재: 📉 💥 ⚡

##예시 결과:
➖📈**BNK경남은행 '울산 신정시장·탑마트🛒 마이태그 이벤트' 진행...** 울산 신정시장에서 20% 또는 30% 할인, 탑마트에서는 1만원 할인. 이벤트 참여 고객 중 100명을 추첨해 아르떼 뮤지엄 부산점 입장권 지급[[🔗Link]]({url})

➖🐮💰**소고기값 좀 싸지려나? 프랑스산 소고기 곧 수입...**'2026년' 수입산 소고기 관세 철폐, 한우농가 소 1마리당 수익성 '-140만원'⬇️, 한우 농가 "교역 희생양" 우려[[🔗Link]]({url})
`

    if (tag === "금융AI") {
      prompt +=`
금융권 AI 뉴스 요약 서비스입니다. 금융권의 AI 관련 뉴스를 요약하는 것이 당신의 역할입니다.
##중점 분야:
1. AI 기반 금융 서비스
2. 챗봇, RPA 등 AI 도입 사례
3. AI 기술 개발 및 투자
4. AI 관련 규제 및 정책
5. AI 인재 양성 및 조직 변화

##특별 강조사항:
- AI 도입으로 인한 정량적 효과
- 새로운 AI 기술 적용 사례
- AI 관련 투자 금액
- AI 프로젝트의 구체적 성과

##반드시 확인해야 할 사항:
- 금융권의 AI 관련 뉴스만 요약
- 최종 요약이 금융권의 AI 관련 뉴스가 아니면 제거
`
    }

    console.log('AI 프롬프트:', prompt);

    const content = await callApi(prompt, newsString); // callApi를 사용하여 요약 생성

    console.log('content: ', content);

    const summaryDate = new Date()
    summaryDate.setHours(6, 0, 0, 0);

    // DailySummary 생성 또는 업데이트
    await prisma.dailySummary.upsert({
      where: {
        date_tag: {
          date: summaryDate,
          tag: tag
        }
      },
      create: {
        date: summaryDate,
        tag: tag,
        summary: content,
        newsCount: news.length
      },
      update: {
        summary: content,
        newsCount: news.length
      }
    });
  } catch (error) {
    console.error('뉴스 요약 중 오류 발생:', error);
    throw new Error('뉴스 요약 중 오류가 발생했습니다.');
  }
}



export async function getDailySummaries(date: string | null, category: string | null) {
  try {
    const startOfDay = new Date(date ?? new Date());
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    };

    if (category) {
      where.category = category;
    }

    const summaries = await prisma.dailySummary.findMany({
      where,
      orderBy: {
        tag: 'asc'
      }
    });

    return summaries;
  } catch (error) {
    console.error('일간 요약 조회 중 오류 발생:', error);
    throw new Error('일간 요약 조회 중 오류가 발생했습니다.');
  }
}
