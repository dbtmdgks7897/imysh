# Portfolio Website — spec.md

> 개인 브랜딩/기술 쇼케이스용 포트폴리오 웹사이트.
> 프로젝트가 메인 콘텐츠이며, 3개 국어(KO/JA/EN)를 지원한다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 목적 | 개인 브랜딩 + 기술 쇼케이스 |
| 대상 | 채용 담당자, 기술 커뮤니티, 잠재 협업자 |
| 언어 | 한국어(기본), 일본어, 영어 |
| 콘텐츠 | 프로젝트 3건 (kigaru 플랫폼 + 기존 2건), 추후 확장 |

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| Framework | Next.js (App Router, Static Export) | kigaru와 동일 패턴 |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS v4 | 커스텀 테마 설정 |
| i18n | next-intl | Static Export 호환 |
| Markdown | next-mdx-remote 또는 contentlayer | 프로젝트 콘텐츠 렌더링 |
| 배포 | Cloudflare Pages | Git 자동 배포, 무료 |
| 도메인 | imysh.pages.dev → 추후 커스텀 도메인 | repo: imysh, ki-garu.com과 분리 |

### 백엔드

없음. 순수 정적 사이트. 모든 콘텐츠는 빌드 타임에 생성.

---

## 3. 디자인 시스템

### 3.1 색상 팔레트

**컨셉 컬러 3색:**

| 이름 | Hex | 용도 |
|---|---|---|
| Lavender Mist | `#c8bfc7` | 서브 배경, 카드 배경, 구분선 |
| Sage Green | `#7a9b76` | 포인트 컬러, 링크, 뱃지, CTA |
| Warm Taupe | `#8a7e72` | 보조 텍스트, 아이콘, 태그 |

**확장 팔레트 (컨셉 컬러에서 파생):**

| 이름 | Hex | 용도 |
|---|---|---|
| Snow | `#faf9fa` | 메인 배경 |
| Light Lavender | `#f0edf0` | 섹션 구분 배경 |
| Dark Sage | `#5a7a56` | 호버/활성 상태 |
| Charcoal | `#2d2a28` | 메인 텍스트 (제목) |
| Dark Gray | `#4a4643` | 본문 텍스트 |
| Mid Gray | `#9e9a96` | 비활성/플레이스홀더 |

### 3.2 타이포그래피

**폰트 패밀리:**

| 용도 | 폰트 | 비고 |
|---|---|---|
| 본문 (KO) | Pretendard | 깔끔한 고딕, 가변 폰트 |
| 본문 (JA) | Noto Sans JP | Google Fonts, Pretendard와 조화 |
| 본문 (EN) | Inter | Google Fonts, 기술 문서에 적합 |
| 코드 | JetBrains Mono | 기술 스택 태그, 코드 블록 |

**폰트 크기 (모바일 → 데스크톱):**

| 요소 | 모바일 | 데스크톱 |
|---|---|---|
| Hero 타이틀 | 28px | 40px |
| 섹션 제목 (h2) | 22px | 28px |
| 서브 제목 (h3) | 18px | 22px |
| 본문 | 15px | 16px |
| 캡션/태그 | 13px | 14px |

### 3.3 레이아웃

- **컨테이너**: max-width 960px, 중앙 정렬
- **반응형**: mobile-first (min 375px), breakpoints: sm(640) / md(768) / lg(1024)
- **프로젝트 카드 그리드**: 1열(모바일) → 2열(md) → 3열(lg, 프로젝트 5개 이상 시)
- **간격**: 기본 단위 8px, 섹션 간 64px, 카드 간 24px

### 3.4 디자인 원칙

- **차분하고 절제된 톤** — 포트폴리오의 주인공은 프로젝트 콘텐츠이지 UI가 아님
- **컬러 절제** — Sage Green은 포인트로만 사용 (링크, 뱃지, CTA), 전체 면적의 10% 이하
- **애니메이션 최소화** — 페이지 전환 fade, 카드 호버 그림자 정도. 스크롤 애니메이션 없음
- **여백 충분** — 콘텐츠 밀도보다 가독성 우선

---

## 4. 페이지 구조

### 4.1 라우팅 구조

```
/[locale]/                          ← 루트 (허브 페이지)
/[locale]/projects/kigaru           ← kigaru 플랫폼 상세
/[locale]/projects/kigaru/kaouranai ← kigaru 하위: 관상 진단 상세
/[locale]/projects/[project-b]      ← 기존 프로젝트 B 상세
/[locale]/projects/[project-c]      ← 기존 프로젝트 C 상세
```

- `[locale]` = `ko` | `ja` | `en`
- 루트 `/` → 브라우저 언어 감지 후 `/ko/`, `/ja/`, `/en/`으로 클라이언트 리다이렉트
- 기본 locale: `ko`

### 4.2 루트 페이지 (허브)

```
┌─────────────────────────────────────────┐
│  [Nav]  이름로고    KO | JA | EN        │
├─────────────────────────────────────────┤
│                                         │
│  [Hero Section]                         │
│  이름                                    │
│  "낭만, 가치"                            │
│  기술 스택 태그 (주요 기술 나열)            │
│  GitHub · LinkedIn · Email (인라인)      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Projects Section]  "Projects"         │
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │ kigaru    │  │ Project B │          │
│  │ 썸네일     │  │ 썸네일     │          │
│  │ 한줄설명   │  │ 한줄설명   │          │
│  │ 스택태그   │  │ 스택태그   │          │
│  │ 상태뱃지   │  │ 상태뱃지   │          │
│  └───────────┘  └───────────┘          │
│  ┌───────────┐                         │
│  │ Project C │                         │
│  │ ...       │                         │
│  └───────────┘                         │
│                                         │
├─────────────────────────────────────────┤
│  [Footer]  © 2026 이름                   │
└─────────────────────────────────────────┘
```

**설계 판단:**
- About 섹션 제거 — Hero의 "낭만, 가치" + 기술 태그로 충분. 프로젝트가 자기소개를 대신함
- Contact를 Hero에 통합 — 별도 섹션 불필요, 아이콘 링크로 간결하게
- 페이지 구성이 Hero + Projects + Footer로 극도로 심플해짐 → 차분한 톤과 일치

### 4.3 프로젝트 카드 컴포넌트

```
┌─────────────────────────┐
│  [썸네일 이미지]          │  ← 프로젝트 스크린샷 또는 대표 이미지
│                          │
│  프로젝트명               │  ← h3, Charcoal
│  한 줄 설명               │  ← 본문 크기, Dark Gray
│                          │
│  [Next.js] [FastAPI] ... │  ← 기술 스택 태그 (Warm Taupe bg)
│                          │
│  ● 배포 완료              │  ← 상태 뱃지 (Sage Green)
│  2026.03                  │  ← 기간, Mid Gray
└─────────────────────────┘
```

카드 전체가 클릭 가능 (→ 상세 페이지). 호버 시 그림자 + 미세한 lift 효과.

### 4.4 프로젝트 상세 페이지

프로젝트 콘텐츠는 **마크다운 파일**로 관리하며, 빌드 시 HTML로 렌더링한다.

```
┌─────────────────────────────────────────┐
│  [Nav]  ← Projects    KO | JA | EN     │
├─────────────────────────────────────────┤
│                                         │
│  [Header]                               │
│  프로젝트명                              │
│  한 줄 설명                              │
│  기간 · 스택 태그 · 상태 뱃지             │
│  [🔗 라이브] [📂 GitHub]                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [TOC — 선택적 사이드바 or 인라인]        │
│                                         │
│  ## 배경 — WHY                          │
│  (마크다운 렌더링)                        │
│                                         │
│  ## 프로세스 — HOW                       │
│  (마크다운 렌더링, 코드블록/다이어그램)     │
│                                         │
│  ## 결과물 — WHAT                        │
│  (스크린샷, 아키텍처 다이어그램, 데모링크)   │
│                                         │
│  ## 기술 판단                             │
│  (테이블: 판단-선택-이유)                  │
│                                         │
│  ## 회고                                 │
│  (배운 점, 다음 계획)                     │
│                                         │
│  --- 하위 프로젝트 (있는 경우) ---         │
│  ┌───────────┐                          │
│  │ kaouranai │ ← 하위 프로젝트 카드       │
│  └───────────┘                          │
│                                         │
├─────────────────────────────────────────┤
│  [← 이전 프로젝트]  [다음 프로젝트 →]     │
├─────────────────────────────────────────┤
│  [Footer]                               │
└─────────────────────────────────────────┘
```

**마크다운 렌더링 스타일링:**
- h2 → 섹션 구분, 상단에 Sage Green 얇은 라인
- h3 → 서브 제목
- 코드 블록 → JetBrains Mono, Light Lavender 배경
- 테이블 → 심플한 보더, Lavender Mist 헤더 배경
- 이미지 → max-width 100%, 라운드 코너, 미세한 그림자

---

## 5. 다국어 (i18n) 설계

### 5.1 구조

```
messages/
  ko.json         ← UI 라벨 (네비게이션, 버튼, 섹션 제목 등)
  ja.json
  en.json

content/
  projects/
    kigaru/
      ko.md       ← 프로젝트 콘텐츠 본문
      ja.md
      en.md
    kigaru/kaouranai/
      ko.md
      ja.md
      en.md
    project-b/
      ko.md
      ja.md
      en.md
    project-c/
      ko.md
      ja.md
      en.md
```

### 5.2 UI 라벨 예시 (messages/ko.json)

```json
{
  "nav": {
    "projects": "프로젝트"
  },
  "hero": {
    "subtitle": "낭만, 가치"
  },
  "projects": {
    "title": "Projects",
    "viewDetail": "자세히 보기",
    "status": {
      "deployed": "배포 완료",
      "inProgress": "진행중",
      "planned": "기획중"
    }
  },
  "projectDetail": {
    "background": "배경 — WHY",
    "process": "프로세스 — HOW",
    "result": "결과물 — WHAT",
    "techDecisions": "기술 판단",
    "retrospective": "회고",
    "subProjects": "하위 프로젝트",
    "liveSite": "라이브 사이트",
    "sourceCode": "소스 코드",
    "prev": "이전 프로젝트",
    "next": "다음 프로젝트"
  },
  "footer": {
    "copyright": "© 2026"
  }
}
```

### 5.3 언어 감지 + 리다이렉트

```
루트 (/) 접속
  → navigator.language 확인
  → ko/ja 포함 시 해당 locale로 리다이렉트
  → 그 외 → /en/ 으로 리다이렉트
  → 사용자가 수동으로 언어 변경 시 선택을 localStorage에 저장
```

### 5.4 SEO 고려

- 각 locale 페이지에 `hreflang` 태그 삽입
- `<html lang="ko">` / `<html lang="ja">` / `<html lang="en">`
- OG 태그도 locale별로 설정

---

## 6. 콘텐츠 데이터 모델

### 6.1 프로젝트 메타데이터

각 프로젝트의 메타데이터는 마크다운 frontmatter로 관리:

```yaml
---
slug: "kigaru"
title:
  ko: "kigaru (気軽)"
  ja: "kigaru (気軽)"
  en: "kigaru (気軽)"
summary:
  ko: "일본 사용자 대상 셀프 디스커버리 엔터테인먼트 플랫폼"
  ja: "日本ユーザー向けセルフディスカバリーエンターテインメントプラットフォーム"
  en: "Self-discovery entertainment platform for Japanese users"
thumbnail: "/images/projects/kigaru/thumbnail.png"
stack: ["Next.js", "React", "Tailwind", "FastAPI", "Gemini Flash"]
status: "in-progress"
period: "2026.03~"
liveUrl: "https://kigaru.pages.dev/"
githubUrl: "https://github.com/..."
order: 1
parent: null
children: ["kigaru-kaouranai"]
---
```

### 6.2 프로젝트 상태 종류

| 값 | 표시 (KO) | 표시 (JA) | 표시 (EN) | 뱃지 색상 |
|---|---|---|---|---|
| `deployed` | 배포 완료 | デプロイ済み | Deployed | Sage Green |
| `in-progress` | 진행중 | 進行中 | In Progress | Warm Taupe |
| `planned` | 기획중 | 企画中 | Planned | Mid Gray |

---

## 7. 컴포넌트 구조

```
app/
├── [locale]/
│   ├── layout.tsx              ← 공통 레이아웃 (Nav + Footer)
│   ├── page.tsx                ← 루트 허브 페이지
│   └── projects/
│       └── [...slug]/
│           └── page.tsx        ← 프로젝트 상세 (동적 라우트)
├── layout.tsx                  ← Root layout (폰트 로딩)
└── page.tsx                    ← / → /[locale]/ 리다이렉트

components/
├── layout/
│   ├── Navigation.tsx          ← 로고 + 언어 토글
│   ├── Footer.tsx
│   └── LanguageSwitcher.tsx    ← KO | JA | EN 토글
├── home/
│   ├── HeroSection.tsx
│   └── ProjectsSection.tsx
├── projects/
│   ├── ProjectCard.tsx         ← 카드 컴포넌트 (루트 + 하위 공용)
│   ├── ProjectHeader.tsx       ← 상세 페이지 헤더
│   ├── ProjectContent.tsx      ← 마크다운 렌더링 래퍼
│   ├── ProjectNav.tsx          ← 이전/다음 네비게이션
│   └── SubProjectList.tsx      ← 하위 프로젝트 카드 목록
└── ui/
    ├── TechTag.tsx             ← 기술 스택 태그
    ├── StatusBadge.tsx         ← 상태 뱃지
    └── BackToTop.tsx           ← (선택) 스크롤 투 탑

lib/
├── i18n.ts                     ← next-intl 설정
├── projects.ts                 ← 프로젝트 메타데이터 로딩 유틸
└── markdown.ts                 ← 마크다운 파싱/렌더링 유틸

content/                        ← 마크다운 콘텐츠 (위 5.1 참조)
messages/                       ← i18n 메시지 (위 5.2 참조)
public/
└── images/
    └── projects/               ← 프로젝트 썸네일, 스크린샷
```

### 동적 라우트 처리

`[...slug]` catch-all 세그먼트로 계층 구조 처리:

- `/ko/projects/kigaru` → slug = `["kigaru"]`
- `/ko/projects/kigaru/kaouranai` → slug = `["kigaru", "kaouranai"]`

`generateStaticParams`에서 모든 프로젝트 경로를 빌드 타임에 생성.

---

## 8. 미결 사항

| # | 항목 | 상태 | 비고 |
|---|---|---|---|
| 1 | 도메인/repo 이름 | ✅ 확정 | `imysh`, imysh.pages.dev |
| 2 | 기존 프로젝트 2건 콘텐츠 | Phase 2 | 포트폴리오 웹 완성 후 마이그레이션 |
| 3 | About 섹션 | ✅ 제거 | Hero로 대체, 필요 시 추후 추가 |
| 4 | Hero 한 줄 소개 | ✅ 확정 | "낭만, 가치" |
| 5 | 다크 모드 | MVP 제외 | 추후 추가 가능 |
| 6 | OG 이미지 | MVP 제외 | 정적 기본 이미지로 시작 |
| 7 | 마크다운 렌더링 라이브러리 | 미정 | next-mdx-remote vs contentlayer vs 직접 파싱 |
| 8 | 이미지 최적화 | 미정 | Static Export에서 next/image 제한 → 대안 필요 |
