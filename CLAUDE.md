# Monimo

엑셀 없이, 수식 없이 — 하루 5분으로 쓰는 개인 웹 가계부.

## 프로젝트 개요

- **앱 이름**: Monimo
- **타겟**: 엑셀이 귀찮거나 어려운 사람, 가계부를 간편하게 시작하고 싶은 사람
- **아키텍처**: 멀티유저 (Supabase Auth 기반, 사용자별 데이터 격리)

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프론트엔드 | React + Vite, Tailwind CSS, Recharts, React Router |
| 백엔드/DB | Supabase (PostgreSQL + Auth + REST API) |
| 배포 | Vercel (프론트) + GitHub (소스 관리) |
| 개발 도구 | Claude Code + VS Code |

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과물 미리보기
```

## 폴더 구조

```
src/
├── components/
│   ├── ui/          # Button, Input, Badge, Modal 등 기본 요소
│   └── layout/      # Header, Sidebar, PageLayout 등
├── pages/           # 화면 단위 컴포넌트
├── hooks/           # Supabase 쿼리 커스텀 훅
├── lib/
│   └── supabase.js  # Supabase 클라이언트
├── utils/           # 날짜·금액 포맷 유틸
└── App.jsx          # 라우팅 설정
```

## 코딩 컨벤션

- 컴포넌트 파일: `PascalCase.jsx`
- 유틸/훅 파일: `camelCase.js`
- Supabase 쿼리 로직은 반드시 `hooks/`에 작성 (페이지 컴포넌트에 직접 쓰지 않음)
- 금액 표시: `amount.toLocaleString('ko-KR') + '원'`
- 날짜 표시: `YYYY.MM.DD` 형식

## 주요 문서 위치

- `docs/architecture.md` — DB 스키마, Supabase 테이블 구조
- `docs/features.md` — MVP 기능 명세
- `docs/design-system.md` — UI 색상·컴포넌트 패턴
- `docs/phase.md` — 전체 개발 단계 순서 (Phase 1~9)
