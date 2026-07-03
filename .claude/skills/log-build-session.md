---
name: log-build-session
description: Use when a feature, fix, or UX change has been implemented and verified in this session, to record decisions and rationale in the project build-log under docs/build-logs/
---

# log-build-session

## Overview

세션에서 구현하고 검증한 내용을 `docs/build-logs/phase{N}-build-log.md`에 새 섹션으로 기록한다.  
CLAUDE.md 규칙: "AI 판단 근거, 수행 작업(생성/수정 파일), 채택하지 않은 대안과 이유" 포함.

## Steps

1. **Phase 파악** — 현재 작업이 몇 Phase에 속하는지 대화 맥락 또는 `git log --oneline -5`로 확인
2. **기존 파일 읽기** — `docs/build-logs/phase{N}-build-log.md` 읽어서 마지막 섹션 번호 확인
3. **다음 섹션 번호 결정** — `{N}-{마지막번호+1}` (예: 6-8이 마지막이면 6-9)
4. **섹션 작성** — 아래 템플릿 사용
5. **파일에 추가** — `---` 구분선 앞, 검증 테이블 앞에 삽입

## Section Template

```markdown
## {N}-{번호}. {기능명 — 한 줄 제목}

**작성일:** YYYY-MM-DD

### 문제

[왜 이 작업이 필요했는지 — 기존 UX/코드의 어떤 문제를 해결하는가]

### 검토한 옵션

| 방식   | 채택 여부 | 이유           |
| ------ | --------- | -------------- |
| 방식 A | ✅ / ❌   | 선택/거절 근거 |

### 결정 및 구현

[채택한 방식의 구체적인 구현 내용 — 수정한 파일, 사용한 훅/컴포넌트, 설계 판단]

### 알려진 이슈 (미수정)

[검증 중 발견했지만 이번에 수정하지 않은 문제. 없으면 이 항목 생략]
```

## Rules

- 검증 완료 항목 표 **앞**에 삽입 (표는 파일 맨 끝에 유지)
- 대화에서 논의된 대안이 있으면 반드시 표에 포함
- 파일이 없으면 새로 생성
- 코드나 파일 목록을 장황하게 나열하지 않음 — 판단 근거와 결정이 핵심
