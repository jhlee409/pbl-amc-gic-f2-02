# AMC GI Upper F2 PBL Application

## 개요

이 프로젝트는 의료 PBL(Problem-Based Learning)을 위한 풀스택 교육 애플리케이션입니다. refractory GERD(위식도역류질환) 환자의 진단과 치료에 초점을 맞춘 인터랙티브한 의료 케이스 스터디를 제공합니다.

## 기술 스택

### 프론트엔드
- **React 18** with TypeScript
- **Vite** for build tool
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for state management
- **Wouter** for routing

### 백엔드
- **Node.js** with Express.js
- **TypeScript**
- **Drizzle ORM** for database operations
- **Supabase** for database and storage

## 프로젝트 구조

```
pbl-amc-gic-f2-02/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   └── lib/           # 유틸리티
│   └── index.html
├── server/                # Express 백엔드
│   ├── index.ts           # 서버 진입점
│   ├── routes.ts          # API 라우트
│   └── storage.ts         # 데이터베이스 스토리지
├── shared/                # 공유 타입 정의
└── migrations/            # 데이터베이스 마이그레이션
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=https://hokwescexyufkisxulqe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhva3dlc2NleHl1Zmtpc3h1bHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjIxNjAsImV4cCI6MjA2OTMzODE2MH0.SS9wztt7rOzsGYwDG_ozPKVYctCylvK32RwwmME2t2I
```

### 3. 개발 서버 실행

```bash
npm run dev
```

이 명령어는 다음을 실행합니다:
- Vite 개발 서버 (프론트엔드)
- Express 서버 (백엔드)

### 4. 프로덕션 빌드

```bash
npm run build
```

### 5. 프로덕션 서버 실행

```bash
npm start
```

## 주요 기능

### PBL 인터랙션
- 단계별 의료 케이스 프레젠테이션
- 사용자 응답 추적
- 진행 상황 저장

### 이미지 표시
- Supabase Storage를 통한 의료 이미지 제공
- 로딩 상태 및 에러 처리
- 반응형 이미지 디스플레이

### 세션 관리
- 사용자 학습 진행 상황 추적
- 데이터베이스 기반 세션 저장
- 자동 진행 상태 복원

## 배포

### Vercel 배포

1. Vercel CLI 설치:
```bash
npm i -g vercel
```

2. 프로젝트 배포:
```bash
vercel
```

3. 환경 변수 설정:
   - Vercel 대시보드에서 프로젝트 설정
   - Environment Variables 섹션에서 `.env` 파일의 변수들을 추가

## 개발 가이드

### 코드 스타일
- TypeScript strict 모드 사용
- React 함수형 컴포넌트 사용
- Tailwind CSS 클래스 우선 사용

### 데이터베이스 마이그레이션
```bash
npm run db:push
```

### 타입 체크
```bash
npm run check
```

## 라이선스

MIT License 