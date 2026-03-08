# imysh — Portfolio Website

## 프로젝트 개요

개인 브랜딩 + 기술 쇼케이스용 포트폴리오 웹사이트.
프로젝트가 메인 콘텐츠이며, 3개 국어(KO/JA/EN)를 지원한다.

- 목적: 채용 담당자, 기술 커뮤니티, 잠재 협업자 대상
- 배포: Cloudflare Pages (imysh.pages.dev)
- 콘텐츠: 순수 정적 사이트, 빌드 타임에 모든 콘텐츠 생성

## 기술 스택

- **Framework**: Next.js (App Router, Static Export), TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl
- **Markdown**: next-mdx-remote
- **배포**: Cloudflare Pages

## 빌드 & 테스트

```bash
npm run dev      # 개발 서버 (localhost)
npm run build    # Static Export → out/ 디렉토리
npm run lint     # ESLint
```

## 디렉토리 구조

```
app/
├── [locale]/
│   ├── layout.tsx              # 공통 레이아웃 (Nav + Footer)
│   ├── page.tsx                # 루트 허브 페이지
│   └── projects/
│       └── [...slug]/
│           └── page.tsx        # 프로젝트 상세 (동적 라우트)
├── layout.tsx                  # Root layout (폰트 로딩)
└── page.tsx                    # / → /[locale]/ 리다이렉트

components/
├── layout/                     # Navigation, Footer, LanguageSwitcher
├── home/                       # HeroSection, ProjectsSection
├── projects/                   # ProjectCard, ProjectHeader, ProjectContent, ...
└── ui/                         # TechTag, StatusBadge, ...

lib/
├── i18n.ts                     # next-intl 설정
├── projects.ts                 # 프로젝트 메타데이터 로딩 유틸
└── markdown.ts                 # 마크다운 파싱/렌더링 유틸

content/projects/               # 마크다운 콘텐츠 (locale별)
messages/                       # i18n 메시지 (ko.json, ja.json, en.json)
public/images/projects/         # 프로젝트 썸네일, 스크린샷
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
| EN | Inter |
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

1. `content/projects/[slug]/[locale].md` 파일 생성
2. frontmatter에 메타데이터 작성 (`spec.md` 6.1 참조)
3. 하위 프로젝트: `content/projects/[parent]/[child]/[locale].md`

## 라우팅 구조

```
/[locale]/                          # 루트 허브
/[locale]/projects/kigaru           # kigaru 상세
/[locale]/projects/kigaru/kaouranai # kigaru 하위 프로젝트
```

루트 `/` → 브라우저 언어 감지 → `/ko/` | `/ja/` | `/en/` 리다이렉트

## 구현 마일스톤

- **M0**: 프로젝트 세팅 (create-next-app, 디렉토리 구조)
- **M1**: 디자인 시스템 + 레이아웃 쉘 (Nav, Footer, 테마)
- **M2**: 루트 허브 페이지 (Hero, ProjectCards)
- **M3**: 프로젝트 상세 페이지 (마크다운, 동적 라우트, 계층)
- **M4**: 다국어 i18n (3개 국어 전환)
- **M5**: 콘텐츠 투입 + Cloudflare Pages 배포

자세한 태스크: `prompt_plan.md` 참조
기능 명세: `spec.md` 참조
