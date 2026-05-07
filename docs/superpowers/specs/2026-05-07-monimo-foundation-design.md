# Monimo 프로젝트 기반 설계 (브레인스토밍 결과)

날짜: 2026-05-07

## 확정된 설계 결정사항

| 항목 | 결정 |
|------|------|
| 앱 이름 | Monimo |
| 아키텍처 | 멀티유저 (Supabase Auth, 사용자별 데이터 격리) |
| 인증 | MVP: 이메일/비밀번호, v2: Google OAuth 추가 |
| 카테고리 | 프리셋 제공 + 사용자 커스텀 추가 가능 |
| 통화/로케일 | 한국 기본 (₩, YYYY.MM.DD, 1,000 콤마) |
| UI 테마 | 밝고 깔끔한 화이트 계열, 인디고 포인트, 라이트 모드 전용 |
| 이체 | 계좌 간 이동 추적 (transfers 별도 테이블, 수입/지출 계산 제외) |
| 문서 구조 | CLAUDE.md (핵심 요약) + docs/ 폴더 (상세 분리) |

## 기술 스택

- 프론트: React + Vite, Tailwind CSS, Recharts, React Router
- 백엔드: Supabase (PostgreSQL + Auth + REST API)
- 배포: Vercel + GitHub
- 개발: Claude Code + VS Code
- 비용: ₩0/월

## MVP 범위 (v1)

1. 인증 (회원가입/로그인/로그아웃)
2. 거래 입력 (지출/수입/이체)
3. 월별 요약 대시보드
4. 예산 설정
5. 계좌 관리
6. 카테고리 관리

## 데이터 모델 요약

테이블 6개: `profiles`, `accounts`, `categories`, `transactions`, `transfers`, `budgets`

상세 스키마 → `docs/architecture.md` 참조

## 다음 단계

1. React + Vite 프로젝트 초기화 (`npm create vite@latest`)
2. Tailwind CSS 설치 및 설정
3. Supabase 프로젝트 생성 + 테이블 생성
4. 인증 화면 구현부터 시작
