# Portfolio Website — prompt_plan.md

> 마일스톤 기반 구현 계획.
> Claude Code + Claude Forge 워크플로우로 실행.

---

## 마일스톤 총괄

| # | 마일스톤 | 설명 | 예상 |
|---|---|---|---|
| M0 | 프로젝트 세팅 | repo 생성, 의존성, 빌드 파이프라인 | 30분 |
| M1 | 디자인 시스템 + 레이아웃 | 테마 설정, Nav/Footer, 반응형 기반 | 1시간 |
| M2 | 루트 허브 페이지 | Hero + Projects + About + Contact | 1.5시간 |
| M3 | 프로젝트 상세 페이지 | 마크다운 렌더링 + 동적 라우트 + 계층 구조 | 2시간 |
| M4 | 다국어 (i18n) | 경로 기반 라우팅 + UI 라벨 + 콘텐츠 번역 | 1.5시간 |
| M5 | 콘텐츠 투입 + 배포 | kigaru 콘텐츠 3개 국어 작성 + Cloudflare 배포 | 1시간 |

---

## M0: 프로젝트 세팅

### 목표
빌드 가능한 빈 프로젝트 + 개발 서버 구동 확인.

### 태스크

```
M0-1: Next.js 프로젝트 생성
  - npx create-next-app (TypeScript, Tailwind, App Router)
  - Static Export 설정 (next.config: output: 'export')
  - 불필요한 보일러플레이트 제거

M0-2: 디렉토리 구조 세팅
  - components/ (layout, home, projects, ui)
  - content/ (projects/, about/)
  - messages/ (ko.json, ja.json, en.json)
  - public/images/projects/
  - lib/

M0-3: 기본 설정
  - tsconfig.json 경로 alias (@/ → src 또는 루트)
  - .gitignore
  - CLAUDE.md 작성 (Claude Code용 프로젝트 규칙)

M0-4: 빌드 확인
  - dev 서버 기동
  - Static Export 빌드 성공 확인
```

### 완료 조건
- `npm run dev` → localhost 접속 가능
- `npm run build` → `out/` 디렉토리에 정적 파일 생성

---

## M1: 디자인 시스템 + 레이아웃 쉘

### 목표
컨셉 컬러/폰트/간격이 적용된 공통 레이아웃.

### 태스크

```
M1-1: Tailwind 테마 설정
  - 커스텀 색상 등록 (snow, lavender, sage, taupe, charcoal 등)
  - 커스텀 폰트 패밀리 등록
  - 간격/반응형 breakpoint 확인

M1-2: 폰트 로딩
  - Google Fonts: Inter, Noto Sans JP (next/font/google)
  - Pretendard: CDN 또는 self-host (next/font/local)
  - JetBrains Mono: 코드 블록용
  - locale별 폰트 전환 로직 (KO→Pretendard, JA→Noto Sans JP, EN→Inter)

M1-3: Root Layout (app/layout.tsx)
  - 폰트 로딩 + <html lang> 설정
  - 메타데이터 기본값

M1-4: Navigation 컴포넌트
  - 좌: 이름/로고 텍스트
  - 우: 언어 토글 (KO | JA | EN) — 이 시점에서는 하드코딩 OK
  - 모바일: 동일 레이아웃 (페이지 수가 적으므로 햄버거 메뉴 불필요)
  - sticky header, 배경 blur

M1-5: Footer 컴포넌트
  - © 2026 이름
  - GitHub / LinkedIn / Email 아이콘 링크

M1-6: 레이아웃 조합 확인
  - Nav + 빈 main + Footer 구조
  - 반응형 확인 (375px / 768px / 1024px)
```

### 완료 조건
- 3개 화면 너비에서 Nav + Footer 정상 표시
- 컨셉 컬러와 폰트가 적용된 상태

---

## M2: 루트 허브 페이지

### 목표
프로젝트 카드가 나열된 원페이지 허브.

### 태스크

```
M2-1: HeroSection 컴포넌트
  - 이름 (h1)
  - "낭만, 가치" (한 줄 소개)
  - 기술 스택 태그 나열 (TechTag 컴포넌트 사용)
  - GitHub / LinkedIn / Email 아이콘 링크 (인라인)

M2-2: TechTag 컴포넌트
  - 작은 둥근 태그, Warm Taupe 배경 + 흰 텍스트
  - JetBrains Mono 폰트
  - props: label (string)

M2-3: StatusBadge 컴포넌트
  - 작은 원형 인디케이터 + 텍스트
  - status prop → 색상 매핑 (deployed→Sage, in-progress→Taupe, planned→Gray)

M2-4: ProjectCard 컴포넌트
  - 썸네일 이미지 (없으면 플레이스홀더)
  - 프로젝트명, 한 줄 설명
  - TechTag 목록
  - StatusBadge
  - 기간
  - 전체 카드 클릭 → 상세 페이지
  - 호버: 그림자 + subtle lift

M2-5: ProjectsSection 컴포넌트
  - 프로젝트 메타데이터 로딩 (lib/projects.ts)
  - ProjectCard 그리드 배치 (1열→2열→3열)
  - order 기준 정렬

M2-6: 루트 페이지 조합
  - Hero → Projects 순서로 조합
  - 섹션 간 간격 확인
```

### 완료 조건
- 루트 페이지에서 프로젝트 카드 표시 (하드코딩 or 임시 데이터)
- 카드 클릭 시 (빈) 상세 페이지로 이동
- 모바일/데스크톱 반응형 정상

---

## M3: 프로젝트 상세 페이지

### 목표
마크다운 기반 프로젝트 상세 + 하위 프로젝트 지원.

### 태스크

```
M3-1: 마크다운 렌더링 환경
  - 라이브러리 선정 + 설치 (next-mdx-remote 추천)
  - 마크다운 → HTML 파이프라인 구축 (lib/markdown.ts)
  - frontmatter 파싱

M3-2: 프로젝트 데이터 로딩 유틸 (lib/projects.ts)
  - content/projects/ 디렉토리 스캔
  - frontmatter에서 메타데이터 추출
  - parent-children 관계 해석
  - locale별 콘텐츠 로딩

M3-3: 동적 라우트 설정
  - app/[locale]/projects/[...slug]/page.tsx
  - generateStaticParams: 전체 프로젝트 경로 생성
  - slug → 프로젝트 매칭 로직

M3-4: ProjectHeader 컴포넌트
  - 프로젝트명, 한 줄 설명
  - 기간 + 스택 태그 + 상태 뱃지
  - 라이브 사이트 / GitHub 링크 버튼
  - 상위 프로젝트 breadcrumb (하위 프로젝트인 경우)

M3-5: ProjectContent 컴포넌트
  - 마크다운 렌더링 결과를 표시
  - 커스텀 스타일링 (h2, h3, code, table, img 등)
  - 코드 블록: JetBrains Mono + Light Lavender 배경
  - 테이블: Lavender Mist 헤더

M3-6: SubProjectList 컴포넌트
  - 하위 프로젝트가 있는 경우에만 표시
  - ProjectCard 재사용
  - "하위 프로젝트" 섹션 제목

M3-7: ProjectNav 컴포넌트
  - 이전/다음 프로젝트 네비게이션
  - ← Projects (루트로 돌아가기)

M3-8: 상세 페이지 조합 + 테스트
  - kigaru 플랫폼 콘텐츠로 테스트 (ko.md만 먼저)
  - kigaru-kaouranai 하위 프로젝트 네비게이션 확인
  - 마크다운 스타일링 전체 확인
```

### 완료 조건
- `/ko/projects/kigaru` → 마크다운 콘텐츠 렌더링
- `/ko/projects/kigaru/kaouranai` → 하위 프로젝트 상세 표시
- kigaru 페이지에서 하위 프로젝트 카드 표시 + 클릭 이동
- 코드 블록, 테이블, 이미지 등 마크다운 요소 정상 스타일링

---

## M4: 다국어 (i18n)

### 목표
3개 국어 전환이 작동하는 완전한 i18n.

### 태스크

```
M4-1: next-intl 설치 + 설정
  - next-intl 설치
  - i18n.ts 설정 (locales, defaultLocale)
  - app/[locale]/layout.tsx에 NextIntlClientProvider 적용

M4-2: 메시지 파일 작성
  - messages/ko.json (기준)
  - messages/ja.json (번역)
  - messages/en.json (번역)

M4-3: LanguageSwitcher 컴포넌트
  - KO | JA | EN 토글
  - 현재 locale 강조 표시
  - 클릭 → 같은 페이지의 다른 locale 버전으로 이동
  - Navigation에 통합

M4-4: 루트 리다이렉트
  - app/page.tsx → 브라우저 언어 감지 → /ko/ or /ja/ or /en/
  - 이전 선택 기억 (localStorage)

M4-5: 전체 컴포넌트 i18n 적용
  - 모든 하드코딩 텍스트를 useTranslations() 호출로 교체
  - Navigation, Footer, HeroSection, ProjectsSection, AboutSection, ContactSection
  - ProjectHeader, ProjectNav

M4-6: locale별 폰트 전환
  - ko → Pretendard 우선
  - ja → Noto Sans JP 우선
  - en → Inter 우선
  - body className에 locale별 폰트 적용

M4-7: SEO 메타데이터
  - <html lang> 동적 설정
  - hreflang 태그 (각 페이지에 3개 alternate)
  - OG 태그 locale별 설정

M4-8: 통합 테스트
  - 3개 locale에서 전체 페이지 확인
  - 언어 전환 시 같은 페이지 유지 확인
  - 루트 리다이렉트 동작 확인
```

### 완료 조건
- `/ko/`, `/ja/`, `/en/` 각각 정상 표시
- 언어 토글로 전환 시 동일 페이지의 다른 언어 버전으로 이동
- UI 라벨 + 프로젝트 콘텐츠 모두 해당 언어로 표시
- hreflang 태그 정상 출력

---

## M5: 콘텐츠 투입 + 배포

### 목표
실제 콘텐츠가 들어간 사이트를 Cloudflare Pages에 배포.

### 태스크

```
M5-1: kigaru 프로젝트 콘텐츠 작성
  - content/projects/kigaru/ko.md (portfolio-kigaru.md 기반)
  - content/projects/kigaru/ja.md (번역)
  - content/projects/kigaru/en.md (번역)
  - frontmatter 메타데이터 확정

M5-2: kigaru-kaouranai 콘텐츠 작성
  - content/projects/kigaru/kaouranai/ko.md (portfolio-kigaru-kaouranai.md 기반)
  - content/projects/kigaru/kaouranai/ja.md (번역)
  - content/projects/kigaru/kaouranai/en.md (번역)

M5-3: 임시 프로젝트 플레이스홀더 (기존 2건)
  - 기본 카드 데이터만 (제목, 한 줄 설명, 스택)
  - 상세 페이지는 "준비중" 표시
  - 추후 노션 콘텐츠 마이그레이션 시 교체

M5-4: 이미지 준비
  - kigaru 스크린샷 (메인 화면, 결과 카드, 모바일 뷰)
  - 프로젝트 썸네일 (카드용, 비율 통일)
  - public/images/projects/에 배치

M5-5: 최종 빌드 + QA
  - Static Export 빌드
  - 전체 페이지 × 3개 언어 수동 확인
  - 깨지는 링크 확인
  - Lighthouse 기본 점수 확인

M5-6: Cloudflare Pages 배포
  - GitHub repo 연결
  - 빌드 설정 (build command, output directory)
  - pages.dev 도메인으로 접속 확인

M5-7: 배포 후 확인
  - 전체 페이지 라이브 접속
  - 모바일 실기기 확인
  - OG 태그 미리보기 확인
```

### 완료 조건
- imysh.pages.dev에서 전체 사이트 접속 가능
- kigaru 프로젝트 콘텐츠 3개 국어 표시
- 기존 프로젝트 2건 플레이스홀더 카드 표시
- 언어 전환, 페이지 이동 모두 정상

---

## Phase 2 백로그 (MVP 이후)

| 항목 | 설명 |
|---|---|
| 기존 프로젝트 마이그레이션 | 노션 → md 변환 + 새 구조 적용 |
| 다크 모드 | 시스템 연동 + 수동 토글 |
| 동적 OG 이미지 | Satori 등으로 프로젝트별 OG 생성 |
| 커스텀 도메인 | [이름].dev 또는 .com |
| 블로그 섹션 | 기술 블로그 (선택적) |
| 애니메이션 보강 | 페이지 전환, 스크롤 인터랙션 (절제적으로) |
| RSS 피드 | 블로그 추가 시 |
| 분석 | Cloudflare Analytics 또는 Plausible |

---

## CLAUDE.md 초안

Claude Code에 전달할 프로젝트 규칙:

```markdown
# Portfolio Website — CLAUDE.md

## 프로젝트 개요
개인 포트폴리오 웹사이트. 프로젝트 쇼케이스 + 다국어(KO/JA/EN).

## 기술 스택
- Next.js (App Router, Static Export), TypeScript, Tailwind CSS v4
- next-intl (i18n), next-mdx-remote (마크다운 렌더링)
- 배포: Cloudflare Pages

## 디자인 규칙
- 컨셉 컬러: #c8bfc7 (lavender), #7a9b76 (sage), #8a7e72 (taupe)
- 배경: #faf9fa / 텍스트: #2d2a28 (제목), #4a4643 (본문)
- 폰트: Pretendard(KO), Noto Sans JP(JA), Inter(EN), JetBrains Mono(코드)
- 레이아웃: max-width 960px, mobile-first
- 애니메이션 최소화, 여백 충분, 차분한 톤

## 파일 구조
- components/ → layout, home, projects, ui 하위 폴더
- content/ → 마크다운 콘텐츠 (locale별)
- messages/ → i18n 메시지
- lib/ → 유틸리티

## 코딩 컨벤션
- 컴포넌트: 함수형, export default
- 타입: 별도 types/ 또는 컴포넌트 파일 내 정의
- i18n: 하드코딩 텍스트 금지, 반드시 useTranslations() 사용
- 이미지: public/images/projects/ 하위에 배치

## 콘텐츠 추가 방법
1. content/projects/[slug]/[locale].md 파일 생성
2. frontmatter에 메타데이터 작성 (spec.md 6.1 참조)
3. 하위 프로젝트는 content/projects/[parent]/[child]/[locale].md
```
