import { NextResponse } from 'next/server';

const getNews = async () => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('백엔드URL :', backendUrl);
    if (!backendUrl) {
      throw new Error('백엔드 URL이 설정되지 않았습니다');
    }

    const url = new URL(`${backendUrl}/be/api/news`)
    console.log('url :', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('뉴스를 가져오는데 실패했습니다');
    }

    const news = await response.json();
    //console.log('뉴스 데이터 :', news);
    return news;
  } catch (error) {
    console.error('뉴스 데이터 가져오기 오류:', error);
    throw error;
  }
};

export async function GET() {
  try {
    console.log('getNews :');
    const news = await getNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}