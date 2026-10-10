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
npm run check:content  # content/ 전체 검증 (두 로케일, slug·이미지 참조, enum)
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
content/projects/<slug>/meta.yaml         구조 (period, stack, status, order, thumbnail, links)
content/projects/<slug>/{ja,ko}.md        frontmatter(title, summary) + 본문
messages/{ja,ko}.json                     UI 문자열
public/_redirects                         / → /ja, /en* → /ja*
```

## 디자인 시스템

### 컨셉 컬러 3색

| 이름 | Hex | 용도 |
|---|---|---|
| Lavender Mist | `#c8bfc7` | 서브 배경, 카드 배경, 구분선 |
| Sage Green | `#7a9b76` | 포인트 컬러, 링크, 뱃지, CTA |
| Warm Taupe | `#8a7e72` | 보조 텍스트, 아이콘, 태그 |
| Snow | `#faf9fa` | 메인 배경 |
| Charcoal | `#2d2a28` | 메인 텍스트 (제목) |

### 폰트

| 언어 | 폰트 |
|---|---|
| KO | Pretendard |
| JA | Noto Sans JP |
| 코드 | JetBrains Mono |

### 레이아웃 원칙

- max-width 960px, mobile-first
- 애니메이션 최소화 (페이지 전환 fade, 카드 호버 그림자만)
- 여백 충분, 차분한 톤 유지
- Sage Green은 포인트로만 (전체 면적 10% 이하)

## 코딩 컨벤션

- 컴포넌트: 함수형, `export default`
- **하드코딩 텍스트 금지** — 반드시 `useTranslations()` 사용
- 이미지: `public/images/projects/` 하위에 배치
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
