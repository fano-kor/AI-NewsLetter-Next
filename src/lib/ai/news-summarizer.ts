'use server';

import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const DEFAULT_AI_PROMPT = process.env.DEFAULT_AI_PROMPT;

async function callApi(prompt: string, newsString: string) {
  const endpoint = "https://api.perplexity.ai/chat/completions";
  const headers = {
    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
    "Content-Type": "application/json"
  };

  const data = {
    "model": "llama-3.1-sonar-large-128k-online",
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

    const prompt = user.aiPrompt || DEFAULT_AI_PROMPT || "당신은 여러 출처의 중요한 뉴스를 요약하도록 설계된 AI입니다. JSONArray 형식으로 뉴스 기사가 제공되며, 이를 읽고 주요 뉴스를 추출하여 간결한 뉴스 브리핑을 작성하는 것이 당신의 역할입니다.";
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
        content: true
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

export async function createDailySummary(date: Date) {
  try {
    // 해당 일자의 뉴스를 키워드별로 그룹화하여 가져옵니다
    const startOfDay = new Date();
    startOfDay.setDate(startOfDay.getDate() - 1)
    startOfDay.setHours(6, 0, 0, 0);
    //const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const endOfDay = new Date()

    const tags = await prisma.tags.findMany();
    //const keywords = [{"keyword":"경제"}]

    for (const { tag } of tags) {
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
        }
      });

      if (news.length === 0) continue;

      try {
        const newsString = JSON.stringify(news);
        
        // AI를 사용하여 일간 요약 생성
        const prompt = `입력 데이터 형식:
{
  "title": "뉴스 제목",
  "content": "뉴스 본문",
  "url": "뉴스 URL"
}
뉴스 선별 규칙:
1. 제공된 뉴스를 3-5개의 핵심 주제로 그룹화 
2. 각 기사는 가장 연관성 높은 하나의 주제로 분류 

요약 규칙:
1. 시작은 《${tag}》로 시작 
2. 각 뉴스는 이모지(➖)로 시작하고 이모지와 뉴스 사이에는 공백 추가
3. 제목과 내용은 '...'으로 구분
4. 주요 내용은 쉼표(,)로 구분
5. 핵심 수치는 반드시 포함하고 굵게 표시하거나 따옴표로 강조 
6. 뉴스 성격에 맞는 이모지를 제목 앞에 배치
7. 뉴스 내용에 적합한 이모지를 내용 내에 1-2개 추가. 
8. 전체 길이는 200자 이내로 제한

이모지 사용 가이드:
- 경제/금융: 📈 📉 💹 💰 💲 
- 산업/제조: 🏭 🔧 ⚙️ 🚗
- 에너지/환경: ⚡ 🔋 ☢️ 🌱
- 무역/수출: 🚢 ✈️ 📦 🌐
- 증감/변화: ⬆️ ⬇️ ↗️ ↘️
- 위험/주의: ⚠️ 🚨 ❗
- 긍정/호재: 📈 💪 ⭐
- 부정/악재: 📉 💥 ⚡

예시 결과:
➖🔋⚡ 체코 협상단 내달 방한…美·佛 흔들기에도 원전 협상 '계속'...'60여명' 대표단 찾아 본계약 협상 진행, 한국형 원전 운영·건설현장 시찰도, 체코 반독점당국 '90일' 조사 개시
➖🐮💰 소고기값 좀 싸지려나? 프랑스산 소고기 곧 수입...'2026년' 수입산 소고기 관세 철폐, 한우농가 소 1마리당 수익성 '-140만원'⬇️, 한우 농가 "교역 희생양" 우려

위 형식과 규칙에 맞춰 입력된 뉴스를 요약. 특히 다음 사항에 유의:
1. '%', '억원', '만원' 등의 수치는 반드시 포함
2. 증감을 나타내는 수치 앞에는 방향 이모지 추가 (예: 5%⬆️ 3%⬇️) 
3. 연도나 날짜는 작은따옴표로 강조
4. 금액이나 수량은 큰따옴표로 강조`



        const prompt_bck = `# 뉴스 트렌드 분석 및 트윗 요약 생성기

## 입력 데이터
- 분석 영역: ${tag}
- 뉴스 기사 수: ${news.length}개
- 데이터 형식: JsonArray

## 분석 단계

### 1. 뉴스 클러스터링
- 제공된 뉴스를 3-5개의 핵심 주제로 그룹화
- 각 기사는 가장 연관성 높은 하나의 주제로 분류
- 주제당 최소 1개 이상의 기사 포함

### 2. 트윗 스레드 구성
각 주제별로 다음 구조의 트윗 스레드 생성:

#### 주제 소개
[번호 이모지] 주제명
#관련해시태그
[주제 핵심 설명 2-3문장]

#### 상세 분석
💡 주요 인사이트
• [핵심 포인트 1]
• [핵심 포인트 2]
• [핵심 포인트 3]

#### 참고 자료
🔗 관련 뉴스
• [뉴스 제목 1] URL
• [뉴스 제목 2] URL

### 3. 종합 요약 트윗
📊 ${tag} 트렌드 종합
[전체 분석 핵심 메시지]
#해시태그1 #해시태그2 #해시태그3

## 작성 규칙

### 형식 제한
- 각 트윗 길이: 최대 280자
- 해시태그: 주제당 2-3개, 종합 요약에 3-5개
- 이모지: 가독성을 고려하여 적절히 사용

### 콘텐츠 지침
- 객관적이고 전문적인 톤 유지
- 간결하고 명확한 문장 구조
- 핵심 정보 중심의 요약
- 관련 뉴스 URL 반드시 포함

### 품질 체크리스트
- 모든 주요 뉴스가 하나 이상의 주제에 포함됨
- 각 트윗이 280자 제한을 준수함
- 모든 URL이 정확히 포함됨
- 해시태그가 적절히 사용됨
- 이모지가 문맥에 맞게 사용됨`;

const aa=`
${tag} 영역의 ${news.length} 개의 뉴스 기사를 다음 지침에 따라 트위터 형식으로 분석하고 요약해 주세요. 각 뉴스 기사에 대해 제목, 내용 요약, URL이 제공될 것입니다.

1. 뉴스 분석 및 그룹화:
   - ${news.length}개의 기사를 분석하고 최대 5개의 주요 주제로 그룹화하세요.
   - 각 뉴스 기사를 가장 관련성 높은 주제에 포함시키세요.

2. 요약 구조:
   - <<${tag}>>
   - 각 주제에 대해 3개의 연결된 트윗을 작성하세요.
   - 요약을 마무리하는 트윗을 작성하세요.

3. 트윗 작성 지침:
   - 각 트윗은 280자를 초과하지 않아야 합니다.
   - 가독성을 높이기 위해 적절하게 이모지를 사용하세요.

4. 주제 내용 구조:
   - 첫 번째 트윗:
     • 주제 번호 이모지로 시작 (1️⃣, 2️⃣, 3️⃣)
     • 주제 제목과 관련 해시태그
     • 주제에 대한 간단한 설명 (1-2문장)
   - 두 번째 트윗:
     • 💡 이모지로 시작
     • 주요 포인트(2-3개)를 글머리 기호로 나열
   - 세 번째 트윗:
     • 🔗 이모지로 시작
     • 주제와 관련된 뉴스 제목과 URL 나열

5. 언어와 어조:
   - 간결하고 명확한 언어를 사용하세요.
   - 객관적인 어조를 유지하세요.

6. 해시태그:
   - 관련 해시태그는 마무리 트윗에만 포함하세요.
   - 주요 주제와 테마를 요약하는 3-5개의 해시태그를 사용하세요.

7. 최종 확인:
   - 모든 중요한 정보가 포함되었는지 확인하세요.
   - 전체적인 흐름이 논리적이고 이해하기 쉬운지 확인하세요.

## 입력 형식:
각 뉴스 기사에 대해 JsonArray 형태의 정보를 받게 됩니다:
[{
  "title":"뉴스 제목",
  "content":"[뉴스 내용]",
  "url":"[뉴스 기사 URL]"
},
...
{
  "title":"뉴스 제목",
  "content":"[뉴스 내용]",
  "url":"[뉴스 기사 URL]"
      }]

이 지침에 따라 제공된 5개의 뉴스 기사를 요약해 주세요. 총 트윗 수는 "주제", "각 주제에 대한 3개의 트윗", 그리고 "마무리"로 구성되어야 합니다.
`;
        //console.log('AI 프롬프트:', prompt);
    
        const content = await callApi(prompt, newsString); // callApi를 사용하여 요약 생성

        console.log('content: ', content);

        const summaryDate = new Date()
        summaryDate.setHours(6, 0, 0, 0);

        // DailySummary 생성 또는 업데이트
        await prisma.dailySummary.upsert({
          where: {
            date_tag: {
              date: summaryDate,
              tag
            }
          },
          create: {
            date: summaryDate,
            tag,
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

    console.log(`${date.toLocaleDateString()} 일간 요약 생성 완료`);
  } catch (error) {
    console.error('일간 요약 생성 중 오류 발생:', error);
    throw new Error('일간 요약 생성 중 오류가 발생했습니다.');
  }
}

export async function getDailySummaries(date: string | null, category: string | null) {
  try {
    const startOfDay = new Date(date || new Date());
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
