---
name: portfolio-page-generator
description: 포트폴리오 프로젝트 마크다운 파일을 받아 포트폴리오 웹사이트의 상세 페이지 콘텐츠 파일을 생성하는 스킬. 사용자가 portfolio-*.md 형태의 프로젝트 설명 파일을 제공하면, 3개 국어(KO/JA/EN) 콘텐츠 마크다운 파일과 frontmatter 메타데이터를 자동으로 생성한다. /n 트리거: "프로젝트 페이지 추가", "포트폴리오에 프로젝트 추가", "이 md로 상세 페이지 만들어", portfolio-*.md 파일이 업로드되었을 때, 콘텐츠 마크다운 생성 요청 시 반드시 이 스킬을 사용할 것.
---

# Portfolio Page Generator

포트폴리오 프로젝트 마크다운(portfolio-*.md)을 입력받아, imysh 포트폴리오 웹사이트의 콘텐츠 파일을 생성한다.

---

## 입력

사용자가 제공하는 파일:
- `portfolio-[slug].md` — 프로젝트 설명 마크다운 (한국어 기준)
- 하위 프로젝트인 경우: `portfolio-[parent]-[child].md`

## 출력

### 1. 콘텐츠 파일 (3개 국어)

**일반 프로젝트:**
```
content/projects/[slug]/ko.md    ← 한국어 (원본 기반)
content/projects/[slug]/ja.md    ← 일본어 (번역)
content/projects/[slug]/en.md    ← 영어 (번역)
```

**하위 프로젝트:**
```
content/projects/[parent]/[child]/ko.md
content/projects/[parent]/[child]/ja.md
content/projects/[parent]/[child]/en.md
```

### 2. 각 파일의 구조

```markdown
---
slug: "[slug]"
title:
  ko: "프로젝트 제목"
  ja: "プロジェクトタイトル"
  en: "Project Title"
summary:
  ko: "한 줄 설명"
  ja: "一行説明"
  en: "One-line description"
thumbnail: "/images/projects/[slug]/thumbnail.png"
stack: ["Next.js", "React", "..."]
status: "deployed" | "in-progress" | "planned"
period: "2026.03~"
liveUrl: "https://..."
githubUrl: "https://github.com/..."
order: 1
parent: null | "[parent-slug]"
children: ["child-slug"] | []
---

[마크다운 본문 — 해당 locale 언어로]
```

---

## 변환 규칙

### Step 1: 원본 마크다운 분석

입력 파일에서 다음을 추출한다:

| 추출 항목 | 소스 위치 | frontmatter 필드 |
|---|---|---|
| 프로젝트명 | `## 헤더` 아래 `### 제목` | `title` |
| 한 줄 설명 | 헤더 아래 첫 번째 설명 문장 | `summary` |
| 기간 | 헤더 테이블의 "기간" 행 | `period` |
| 기술 스택 | 헤더 테이블의 "스택" 행 | `stack` (배열로 파싱) |
| 상태 | 헤더 테이블의 "상태" 행 | `status` (deployed/in-progress/planned 매핑) |
| 사이트 URL | 헤더 테이블의 "사이트" 행 | `liveUrl` |
| 상위 프로젝트 | 헤더 테이블의 "상위 프로젝트" 행 (있는 경우) | `parent` |

### Step 2: frontmatter 생성

추출한 정보로 frontmatter를 구성한다.

**status 매핑:**
- "MVP 배포 완료", "배포 완료", "라이브" → `deployed`
- "진행중", "개발중", "기능 추가 진행중" → `in-progress`
- "기획중", "구상중", "기획 전" → `planned`

**stack 파싱:**
- "Next.js 16 · React 19 · Tailwind v4 · FastAPI · Gemini 2.0 Flash"
- → `["Next.js", "React", "Tailwind", "FastAPI", "Gemini Flash"]`
- 버전 번호는 제거 (카드 태그에서 간결하게 표시하기 위해)

**order:**
- 사용자에게 확인 요청. 기본값은 기존 프로젝트 수 + 1

### Step 3: 본문 변환

원본 마크다운의 섹션을 포트폴리오 상세 페이지 구조에 맞게 재편집한다.

**포트폴리오 상세 페이지 표준 구조:**

```markdown
## 배경 — WHY
[원본의 "1. 배경" 섹션]

## 프로세스 — HOW
[원본의 "2. 프로세스" 섹션]

## 결과물 — WHAT
[원본의 "3. 결과물" 섹션]

## 기술 판단
[원본에 기술 판단 테이블이 있으면 포함]

## 회고
[원본의 "5. 회고" 또는 "회고" 섹션]
```

**변환 시 주의:**
- `## 헤더` 섹션은 본문에 포함하지 않음 (frontmatter로 이동)
- 원본에 없는 섹션은 생략 (빈 섹션 만들지 않음)
- 원본의 섹션 번호(1., 2., 3...)는 제거
- 스크린샷 플레이스홀더 (`> [스크린샷 삽입: ...]`)는 유지 — 이미지 추가는 별도 작업
- 코드 블록, 테이블, 다이어그램은 그대로 유지
- 하위 프로젝트 관련 섹션 (예: "4. 하위 프로젝트")은 본문에 포함하지 않음 — 사이트에서 자동 렌더링

### Step 4: 번역

한국어 본문을 일본어와 영어로 번역한다.

**번역 원칙:**
- 기술 용어(Next.js, FastAPI, Gemini 등)는 번역하지 않음
- 프로젝트 고유명(kigaru, kaouranai 등)은 번역하지 않음
- 일본어: 자연스러운 일본어, です/ます 체 사용
- 영어: 간결하고 프로페셔널한 톤
- 코드 블록 내 주석도 번역
- 테이블 내용도 번역
- 한국 관상학 관련 용어는 일본어 한자(韓国人相学) + 원어 병기

### Step 5: 파일 생성 및 배치

1. 디렉토리 생성: `content/projects/[slug]/` (또는 `content/projects/[parent]/[child]/`)
2. `ko.md` 생성 (한국어 frontmatter + 한국어 본문)
3. `ja.md` 생성 (일본어 frontmatter + 일본어 본문)
4. `en.md` 생성 (영어 frontmatter + 영어 본문)
5. 이미지 디렉토리 생성: `public/images/projects/[slug]/` (빈 폴더, 스크린샷 추가용)

---

## 체크리스트

생성 완료 후 다음을 확인:

- [ ] frontmatter의 모든 필수 필드가 채워져 있는가
- [ ] 3개 locale 파일이 모두 생성되었는가
- [ ] slug가 기존 프로젝트와 충돌하지 않는가
- [ ] parent/children 관계가 올바른가 (하위 프로젝트인 경우)
- [ ] 본문이 표준 구조(WHY → HOW → WHAT → 회고)를 따르는가
- [ ] 기술 용어/고유명이 번역되지 않았는가
- [ ] 빌드가 정상적으로 되는가 (`npm run build`)

---

## 예시

### 입력: portfolio-kigaru-kaouranai.md

(헤더 테이블에서 추출)
```
slug: "kaouranai"
title.ko: "한국 관상학 AI 진단"
title.ja: "韓国人相学AI診断"
title.en: "Korean Physiognomy AI Diagnosis"
stack: ["Next.js", "React", "Tailwind", "FastAPI", "Gemini Flash"]
status: "in-progress"
period: "2026.03.03~"
parent: "kigaru"
```

### 출력 파일 경로
```
content/projects/kigaru/kaouranai/ko.md
content/projects/kigaru/kaouranai/ja.md
content/projects/kigaru/kaouranai/en.md
public/images/projects/kaouranai/   (빈 폴더)
```
