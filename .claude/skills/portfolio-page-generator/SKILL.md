---
name: portfolio-page-generator
description: 사용자가 채팅에 붙여넣은 portfolio-*.md 형식의 텍스트(notion-to-portfolio 스킬의 출력물)를 받아 imysh 포트폴리오 사이트에 새 프로젝트 페이지를 생성하는 Claude Code 스킬. /n content/projects 디렉토리에 3개 국어(ko/ja/en) 마크다운 파일을 만들고, lib/projects.ts의 PROJECTS 배열에 카드 항목을 자동 삽입하며, 라우팅이 정상 동작하는지 검증한다. /n 트리거: "이 md로 상세 페이지 만들어", "포트폴리오 페이지 생성", "portfolio-*.md 적용", "프로젝트 추가", "새 프로젝트 페이지",사용자가 portfolio-*.md 형식의 마크다운 텍스트를 붙여넣었을 때, 사용자가 프로젝트 추가/페이지 생성을 요청할 때 반드시 이 스킬을 사용할 것.
---

# Portfolio Page Generator

사용자가 채팅에 붙여넣은 portfolio-*.md 형식의 마크다운 텍스트를 받아
imysh Next.js 포트폴리오 사이트에 새 프로젝트를 완전히 통합하는 스킬이다.

---

## 파이프라인 위치

```
[사용자가 채팅에 portfolio-*.md 텍스트 붙여넣기]
    │
    ▼  ← 이 스킬 (Claude Code에서 실행)
    │
    ├─ content/projects/[slug]/ko.md   ← frontmatter + 본문
    ├─ content/projects/[slug]/ja.md   ← AI 번역
    ├─ content/projects/[slug]/en.md   ← AI 번역
    ├─ lib/projects.ts                 ← PROJECTS 배열에 항목 삽입
    └─ 빌드 검증
```

---

## 전제 조건

- 사용자가 채팅 메시지에 portfolio-*.md 형식의 마크다운 텍스트를 붙여넣어야 한다
- imysh 프로젝트의 디렉토리 구조가 아래와 일치해야 한다:
  - `content/projects/` — 프로젝트 콘텐츠 디렉토리
  - `lib/projects.ts` — PROJECTS 배열이 포함된 파일
  - `lib/markdown.ts` — 마크다운 파싱 유틸리티

---

## 실행 순서

### Step 1: 붙여넣은 텍스트 파싱

사용자가 채팅에 붙여넣은 마크다운 텍스트를 portfolio-*.md 형식으로 인식하고 파싱한다.

**입력 인식 기준:**
사용자 메시지에 아래 패턴이 포함되어 있으면 portfolio-*.md 텍스트로 간주한다:
- `# [slug] — 프로젝트 포트폴리오` 형태의 첫 번째 h1
- `## 헤더` 섹션 + 메타데이터 테이블
- `## 1. 배경 — WHY` 등 번호가 붙은 섹션 제목

**slug 추출:**
- 첫 번째 h1의 `# [slug] — 프로젝트 포트폴리오` 에서 slug를 추출한다
- slug가 불분명하면 사용자에게 확인한다

**헤더 테이블에서 추출할 메타데이터:**

| 필드 | frontmatter 키 | 필수 여부 |
|------|----------------|-----------|
| 프로젝트명 | `title` | 필수 |
| 한 줄 설명 | `summary` | 필수 |
| 기간 | `period` | 필수 |
| 스택 | `stack` (배열) | 필수 |
| 상태 | `status` | 필수 |
| 사이트 | `liveUrl` | 선택 |
| GitHub | `githubUrl` | 선택 |
| 상위 프로젝트 | parent slug | 선택 |

**slug 추출 (보조):**
- 헤더 테이블의 `상위 프로젝트` 행이 있으면 → 하위 프로젝트로 판단
- 하위 프로젝트: parent slug 아래 child slug 경로로 처리

**status 매핑:**

| portfolio-*.md 값 | frontmatter 값 |
|-------------------|----------------|
| 운영중, 배포됨, deployed, live | `deployed` |
| 개발중, 진행중, in-progress | `in-progress` |
| 기획중, 예정, planned | `planned` |

**본문 섹션:**
- 첫 번째 `## N.` 패턴의 섹션 이후 텍스트 → 본문 시작 (WHY, WHAT, HOW 등 어느 섹션이든 상관 없음)
- 각 `## N. 섹션명` 구분자를 유지한 채 본문으로 사용
- 헤더 테이블 위의 내용(slug 주석, 프로젝트명 등)은 제거하고 frontmatter로 이동
- **이미지**: 마크다운 이미지 `![alt](url)` 은 그대로 유지한다 (외부 URL 포함)
- **이미지 플레이스홀더** `> [스크린샷: 설명]` 도 그대로 유지한다

### Step 2: ko.md 생성

`content/projects/[slug]/ko.md` 파일을 생성한다.

**frontmatter 형식** (기존 프로젝트와 동일):

```yaml
---
title: "[프로젝트명]"
summary: "[한 줄 설명]"
stack: ["기술1", "기술2", "기술3"]
status: "[deployed|in-progress|planned]"
period: "[기간]"
liveUrl: "[URL]"          # 있을 때만
githubUrl: "[GitHub URL]" # 있을 때만
thumbnail: "[URL 또는 /images/projects/[slug]/thumbnail.jpg]"  # 있을 때만
order: [숫자]
---
```

> **thumbnail 이원화**: 최상위 프로젝트의 thumbnail은 **PROJECTS 배열(lib/projects.ts)에만** 설정한다.
> frontmatter의 thumbnail은 하위 프로젝트(SubProjectList에서 표시) 용도로만 사용한다.
> 단, 사용자가 명시적으로 frontmatter에도 넣으라고 하면 그에 따른다.

**본문 변환 규칙:**
- portfolio-*.md의 `## N. 섹션명` 형식을 그대로 유지
- 이미지 플레이스홀더 `> [스크린샷: 설명]` 은 그대로 유지
- 테이블, 코드 블록, 리스트 등 마크다운 문법 보존
- 불필요한 구분선(`---`)은 섹션 사이에서 제거 (frontmatter 구분선만 유지)

**하위 프로젝트인 경우:**
- 경로: `content/projects/[parent]/[child]/ko.md`
- 부모 디렉토리가 이미 존재해야 함 (없으면 에러)

### Step 3: ja.md / en.md 번역 생성

ko.md를 기반으로 ja.md와 en.md를 생성한다.

**번역 규칙:**
- frontmatter의 `title`, `summary` 를 번역한다
- frontmatter의 `stack`, `status`, `period`, URL 필드들은 번역하지 않는다 (그대로 유지)
- 본문 전체를 해당 언어로 번역한다
- 섹션 제목도 번역한다 (없는 섹션은 건너뜀):
  - `## N. 배경 — WHY` → ja: `## N. 背景 — WHY` / en: `## N. Background — WHY`
  - `## N. 프로세스 — HOW` (선택) → ja: `## N. プロセス — HOW` / en: `## N. Process — HOW`
  - `## N. 결과물 — WHAT` → ja: `## N. 成果物 — WHAT` / en: `## N. Results — WHAT`
  - `## N. 기술 판단` → ja: `## N. 技術判断` / en: `## N. Technical Decisions`
  - `## N. 회고` → ja: `## N. 振り返り` / en: `## N. Retrospective`
  - 위 목록에 없는 섹션명은 자연스럽게 번역한다
- 테이블 내 한국어 텍스트도 번역한다
- 코드 블록 내부는 번역하지 않는다
- 이미지 플레이스홀더의 설명 텍스트는 번역한다
- 고유명사(프로젝트명, 기술명 등)는 번역하지 않는다

**번역 품질 기준:**
- 자연스러운 문장으로 번역 (직역 금지)
- 일본어: 입니다/합니다 체 (です・ます調)
- 영어: 전문적이지만 읽기 쉬운 톤

### Step 4: lib/projects.ts PROJECTS 배열에 항목 삽입

`lib/projects.ts` 파일의 `PROJECTS` 배열에 새 항목을 추가한다.

**삽입 규칙:**
- `order` 값 기준으로 올바른 위치에 삽입한다
- order가 지정되지 않은 경우, 기존 최대 order + 1 을 할당한다
- placeholder 항목(status가 planned이고 title이 "Project ..."인 항목)보다 앞에 배치한다

**삽입할 객체 형식:**

```typescript
{
  slug: "[slug]",
  title: "[프로젝트명]",
  summary: "[한 줄 설명]",
  stack: ["기술1", "기술2"],
  status: "[status]",
  period: "[기간]",
  githubUrl: "[URL]",                    // 있을 때만
  liveUrl: "[URL]",                      // 있을 때만
  thumbnail: "[외부 URL 또는 /images/projects/[slug]/thumbnail.jpg]",  // 있을 때만
  order: [숫자],
}
```

> **thumbnail 규칙**: 사용자가 외부 URL(R2 CDN 등)을 thumbnail로 제공한 경우 그 URL을 그대로 사용한다.
> 로컬 이미지라면 `/images/projects/[slug]/thumbnail.jpg` 형식을 사용한다.

**AST 수정이 아닌 텍스트 기반 삽입 방식:**
1. `lib/projects.ts` 파일을 읽는다
2. `PROJECTS` 배열의 마지막 항목 `}` 뒤, 배열 닫는 `]` 앞에 새 항목을 삽입한다
3. 기존 코드 스타일(들여쓰기 2칸, trailing comma)을 유지한다
4. order 기준 정렬이 필요하면 배열 전체를 재정렬한다

### Step 5: 검증

생성된 파일과 수정된 코드를 검증한다.

**파일 존재 확인:**
```bash
ls -la content/projects/[slug]/ko.md
ls -la content/projects/[slug]/ja.md
ls -la content/projects/[slug]/en.md
```

**frontmatter 유효성:**
- 필수 필드(title, summary, stack, status, period) 존재 여부
- status 값이 `deployed | in-progress | planned` 중 하나인지
- stack이 배열 형태인지

**PROJECTS 배열 검증:**
- TypeScript 구문 오류 없는지 확인:
```bash
npx tsc --noEmit lib/projects.ts 2>&1 | head -20
```
- 새로 추가된 slug가 배열에 존재하는지 확인

**빌드 검증:**
```bash
npm run build 2>&1 | tail -30
```
- 빌드 성공 시 → 완료
- 빌드 실패 시 → 에러 메시지 분석 후 수정하고 재빌드

**라우트 검증:**
- 빌드 출력에서 `/ko/projects/[slug]` 경로가 생성되었는지 확인
- 3개 locale 모두 생성되었는지 확인

### Step 6: 완료 보고

**완료 보고:**

```
✅ 프로젝트 "[프로젝트명]" 페이지 생성 완료

생성된 파일:
  - content/projects/[slug]/ko.md
  - content/projects/[slug]/ja.md
  - content/projects/[slug]/en.md

수정된 파일:
  - lib/projects.ts (PROJECTS 배열에 항목 추가)

라우트:
  - /ko/projects/[slug]
  - /ja/projects/[slug]
  - /en/projects/[slug]

빌드: ✅ 성공

다음 할 일:
  - (선택) public/images/projects/[slug]/ 에 썸네일 이미지 추가
  - (선택) 번역 내용 직접 검수
```

---

## 엣지 케이스

### 텍스트가 portfolio-*.md 형식이 아닐 때
- 사용자에게 형식을 안내하고, notion-to-portfolio 스킬을 통해 변환할 것을 권장한다
- 필수 요소: h1(slug), 헤더 테이블(메타데이터), 본문 섹션 최소 1개

### 여러 프로젝트를 한 번에 붙여넣었을 때
- `# [slug] — 프로젝트 포트폴리오` 패턴으로 각 프로젝트를 분리한다
- 하나씩 순서대로 처리하고 중간 결과를 보고한다

### 같은 slug의 프로젝트가 이미 존재할 때
- `content/projects/[slug]/`가 이미 있으면 사용자에게 알리고 덮어쓸지 확인한다
- `PROJECTS` 배열에 같은 slug가 있으면 기존 항목을 업데이트한다

### 하위 프로젝트 (parent가 있는 경우)
- parent slug에 해당하는 디렉토리가 존재하는지 확인한다
- 존재하지 않으면 에러: "상위 프로젝트 [parent]가 존재하지 않습니다"
- 하위 프로젝트는 PROJECTS 배열에 추가하지 않는다
  (상위 프로젝트 페이지의 SubProjectList에서 자동으로 스캔됨)

### order 충돌
- 기존 항목과 같은 order 값이면, 기존 항목들의 order를 +1씩 밀어낸다

### 빌드 실패 시
- 에러 메시지를 분석하고 자동 수정을 시도한다
- 자동 수정 불가한 경우 에러 내용을 사용자에게 보고한다

---

## 체크리스트

스킬 실행 완료 후 확인:

- [ ] content/projects/[slug]/ko.md 생성됨 (frontmatter + 본문)
- [ ] content/projects/[slug]/ja.md 생성됨 (자연스러운 일본어 번역)
- [ ] content/projects/[slug]/en.md 생성됨 (자연스러운 영어 번역)
- [ ] 3개 파일의 frontmatter 스키마가 기존 프로젝트(everyai)와 동일
- [ ] lib/projects.ts PROJECTS 배열에 새 항목 삽입됨 (최상위 프로젝트인 경우)
- [ ] 삽입된 항목의 타입이 Project 인터페이스와 일치
- [ ] thumbnail이 있다면 PROJECTS 배열에 정확한 URL/경로로 설정됨
- [ ] order 기준 정렬이 올바름
- [ ] TypeScript 컴파일 에러 없음
- [ ] npm run build 성공
- [ ] 3개 locale × slug 라우트가 빌드 출력에 존재