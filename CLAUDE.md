# imysh — Portfolio Website

## 프로젝트 개요

"나는 어떤 사람인가"를 보여주는 사이트. 일본에서 만나는 사람들이 대상이고,
정체성은 직무가 아니라 "만드는 사람". 기본 언어 ja, 두 번째 ko (en 없음).

- 설계: `docs/superpowers/specs/2026-10-10-imysh-redesign-design.md`
- 진행 상황: `docs/progress.md`
- 배포: Cloudflare Pages (imysh.pages.dev)
- 콘텐츠: 순수 정적 사이트, 빌드 타임에 모든 콘텐츠 생성

## 기술 스택

- **Framework**: Next.js (App Router, Static Export), TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl (ja 기본, ko) — 로케일 목록은 `lib/locales.ts` 한 곳
- **Markdown**: unified + remark-parse + remark-gfm + remark-rehype → React (`components/projects/ProjectContent.tsx`)
- **콘텐츠 검증**: zod (`lib/content/`), `npm run check:content`
- **배포**: Cloudflare Pages

## 빌드 & 테스트

```bash
npm run dev            # 개발 서버 — / 는 404, /ja 로 열 것 (/ 리다이렉트는 public/_redirects, Cloudflare 전용)
npm run build          # Static Export → out/ (콘텐츠 검증 포함)
npm run lint           # ESLint
npm run typecheck      # next typegen && tsc -p tsconfig.json --noEmit
npm run check:content  # content/ 전체 검증 (두 로케일, slug·이미지 참조, enum, 【 금지)
npm run images         # images-src/ → public/images/ (webp 640 + 1280) + lib/content/image-manifest.json
npm run fonts          # 폰트 서브셋 재생성 (새 글자가 생겼을 때)
npm run og             # OG 카드 public/og/ (build 전에 자동 실행)
npm run check:meta     # build 후 out/*.html 의 title·OG·canonical·hreflang 검사
```

## 디렉토리 구조

```
app/[locale]/layout.tsx              html shell, fonts, base metadata, 빌드 시 콘텐츠 검증
app/[locale]/page.tsx                허브
app/[locale]/projects/[...slug]/     프로젝트 상세 (계층 slug)
lib/locales.ts  lib/site.ts  lib/seo.ts  lib/i18n.ts
lib/content/                         schema(zod) · projects · profile(now/path) · validate
scripts/check-content.ts
content/now.yaml + now.{ja,ko}.yaml       "いま" 구조 + 문장
content/path.yaml + path.{ja,ko}.yaml     "ここまで" 구조 + 문장
content/projects/<slug>/meta.yaml         구조 (period, stack, status, order, thumbnail, hero, sections, links)
content/projects/<slug>/{ja,ko}.md        frontmatter(title, summary, role?) + 본문
images-src/images.json                    이미지 원본 목록 (crop 포함) — 결과물은 public/images/ 에 커밋
messages/{ja,ko}.json                     UI 문자열
public/_redirects                         / → /ja, /en* → /ja*
```

## 디자인 시스템 (C3 · やわらかい索引, spec §4)

### 색 — 역할 토큰만 (`app/globals.css` `@theme`)

| 토큰 | 값 | 용도 |
|---|---|---|
| `bg` | `#F7F4EF` | 페이지 바탕 |
| `surface` | `#FFFFFF` | 행 카드, 프로젝트 카드 |
| `surface-sub` | `#FBF8F4` | 하위 행, 칩, `<details>` |
| `text` | `#2E2A27` | 본문·제목 |
| `text-muted` | `#6A625B` | 캡션, 기간 (bg 대비 5.45) |
| `text-soft` | `#4A433E` | "다음으로 간 이유" 줄 |
| `border` | `#E3DDD3` | 헤어라인 |
| `accent-text` | `#B44A30` | 링크, 강조 문구 (bg 대비 4.83) |
| `accent` | `#E9B8A6` | 점, "지금" 행 테두리 — 글자색 금지 |
| `accent-tint` | `#F6DDD2` | 강조 밑줄, 상태 pill 바탕 (위 글자는 `text`) |
| `placeholder` | `#EFE7DE` | 이미지 로딩 바탕 |

색 이름 토큰(snow, sage 등)은 쓰지 않는다. `accent-text` 를 `accent-tint` 위의 작은 글자에 쓰지 않는다 (4.09).

### 폰트 — 사이트 전용 서브셋 (self-host)

| 언어 | 폰트 | 원본 |
|---|---|---|
| JA (+ 모든 가나·한자) | Zen Maru Gothic 400/700 | `fonts-src/*.ttf` (없으면 `npm run fonts`가 내려받음, gitignore, OFL) |
| KO (한글·라틴) | Pretendard 400/700 | `node_modules/pretendard` OTF |
| 코드 | 시스템 monospace | — |

`npm run fonts` 가 사이트에 쓰인 글자만 남겨 `app/fonts/*.woff2`, `app/fonts.css`(생성물, 손으로 고치지 않음),
`lib/content/font-charset.json` 을 만든다. Zen Maru Gothic 은 굵기마다 페이지 기준으로 나눈다:
hub(허브 글자) · 프로젝트별(그 페이지만 쓰는 글자) · shared(나머지). unicode-range 로 필요한 파일만 받는다
(허브는 2개, 상세 페이지는 3–6개). 새 글자가 들어가면 check:content 가 실패하니 `npm run fonts` 후 커밋.
`next/font/google` 금지 (fe46a84). OG 카드(`npm run og`)는 satori용으로 `@fontsource/zen-maru-gothic` woff 슬라이스를 쓴다.
제목은 700, 900 금지. 한국어 `word-break: keep-all`, 일본어 `line-break: strict` (keep-all 금지).

### 레이아웃·접근성

- 허브 max-width 1280px, 상세 1200px, 본문 열 ≈ 40em
- radius 14–20px (히어로 28px), 카드는 테두리 대신 부드러운 그림자, hover 는 그림자만
- 이미지가 없으면 칸을 그리지 않는다 (회색 placeholder 금지)
- 터치 타깃 ≥ 44px, `:focus-visible` 링은 `accent-text`, `prefers-reduced-motion` 존중
- 상세 페이지 섹션: md 의 `##` 를 `meta.yaml` `sections` (why/what/tech/thought) 로 순서대로 매핑

## 코딩 컨벤션

- 컴포넌트: 함수형, `export default`
- **하드코딩 텍스트 금지** — 반드시 `useTranslations()` 사용
- 이미지: 원본은 `images-src/`, `npm run images` 로 생성한 `/images/....webp` 만 참조 (외부 호스트 금지, R2 제거됨)
- 경로 alias: `@/` → 루트

## 콘텐츠 추가 방법

스킬 `.claude/skills/portfolio-page-generator/SKILL.md` 를 쓴다. 원칙: 구조는 한 곳
(`*.yaml`), 문장은 로케일별. 한 로케일이라도 빠지면 빌드가 실패한다 (다른 로케일로
대체하지 않음).

## 라우팅 구조

```
/ja, /ko                                 허브
/{ja,ko}/projects/kigaru                 상세
/{ja,ko}/projects/kigaru/kaouranai       하위 프로젝트
```

`/` 는 Cloudflare Pages `_redirects` 로 `/ja` (302). 옛 `/en/*` 는 `/ja/*` (301).

## 구현 단계 (2026-10 리디자인)

1. Foundation — 데이터 모델·검증, remark, 로케일, 리다이렉트, 메타데이터, CI
2. Visual — C3 토큰, いま 섹션, 경로 표, 타이포, 접근성
3. Content — 볼트 → 한국어 초안 → 일본어 번역, 신규 페이지, 사진
4. Pre-launch — 실기기, OG 미리보기, Lighthouse, main 머지

`spec.md` / `prompt_plan.md` 는 2026-03 최초 구축 기록 (역사 문서).
