# 1. Node.js 버전 확인 (선택사항이지만 권장)
node --version

# 2. npm 의존성 패키지 설치
npm install

# 3. npx prisma 생성
npx prisma generate

# 4.데이터베이스 스키마 업데이트
#npx prisma db push

# 5. schema.prisma의 변경 사항을 데이터베이스에 반영
# 주의: 이 방법은 개발 환경에서만 사용
#npx prisma migrate dev --name add_unique_constraint_to_url

# 4. 개발 서버 실행
npm run dev