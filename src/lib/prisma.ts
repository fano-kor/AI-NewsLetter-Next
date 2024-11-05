import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

// 쿼리 로그를 출력하는 이벤트 리스너 추가
prisma.$on('query', (e) => {
  console.log(`query: ${e.query}`);
  console.log(`parameters: ${JSON.stringify(e.params)}`);
  console.log(`execution time: ${e.duration}ms`);
});

export default prisma;

