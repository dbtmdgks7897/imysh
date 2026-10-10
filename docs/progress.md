# imysh — progress

## Where things stand (2026-10-10)

Portfolio website (personal branding + tech showcase), Next.js 16 App Router
with Static Export, 3 locales (KO/JA/EN). **Live and serving today** at
<https://imysh.pages.dev> via Cloudflare Pages (auto-deploy from
`github.com/dbtmdgks7897/imysh`, branch `main`). Product code has not been
touched since 2026-03-09; the deployment has stayed up by itself.

A full design + structure audit was run on 2026-10-10 (no product code
changed). Verdict: **the foundation is worth building on** — it builds,
type-checks and lints clean, the routing scales, and the 8px spacing rhythm
and 960px container are applied consistently. But the live site is not in a
state to put in front of a recruiter today, because of six specific defects
listed under `## Next` → "Blocks reactivation". All six are localized fixes;
only one (the two-source data model) is architectural.

Verified on 2026-10-10:

- `npm run build` succeeds (Next.js 16.1.6, Turbopack): 16 static pages —
  `/`, `/_not-found`, `/{ko,ja,en}`, and 9 detail routes (3 slugs × 3 locales).
- `npm run lint` (eslint) clean, no output.
- `git status` clean, `main` in sync with `origin/main`, 13 commits total.
- Live routes all return 200: `/`, `/ko`, `/ja`, `/en`,
  `/ko/projects/kigaru`, `/ko/projects/kigaru/kaouranai`,
  `/ko/projects/everyai`, `/ja/projects/everyai`, `/en/projects/kigaru`.
- Live HTML contains `figcaption` markup and the R2 GIF URLs added in the
  final commit `0f6226a`, so the deploy is current with the last commit.

All six planned milestones (M0–M5) in `prompt_plan.md` were completed. The
site is functionally finished for MVP scope; what is thin is **content**.

### Content state

| Project | Content | Notes |
|---|---|---|
| `kigaru` (order 1) | 48-line ko.md + ja/en | Thin: no screenshots, no `liveUrl`, `githubUrl` points at the GitHub profile root, not a repo. Status `in-progress`. No thumbnail → initial-letter fallback card. |
| `kigaru/kaouranai` (sub) | 24-line ko.md + ja/en | Thinnest page. No images, no links. |
| `everyai` (order 2) | 94-line ko.md + ja/en | The one complete case study: background / results / technical decisions / retrospective, 12 R2-hosted GIF screenshots, thumbnail from R2. Status `deployed`. |

`spec.md` planned "3 projects (kigaru platform + 2 existing)". Only one of
the two existing projects (everyai) was migrated. The two placeholder
entries added in M5 were deleted in `2311d4b`, so the hub currently shows
two cards.

### Known gaps / rough edges

- `public/images/projects/` holds only `.gitkeep`. Every image on the site
  is an external Cloudflare R2 URL
  (`pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev`). If that bucket goes away
  the everyai page loses all its screenshots.
- No `liveUrl` on any project, so the "라이브" button in `ProjectHeader`
  never renders.
- No tests of any kind (no test runner, no CI config in the repo).
- `spec.md` §8 items 5–8 still open: dark mode, OG images, image
  optimization under Static Export.
- Root `/` redirect is client-side JS only (`app/page.tsx`); crawlers
  landing on `/` see an empty page.
- No `README.md` (removed in M0).
- No environment variables are used anywhere — no `process.env` reference in
  the codebase, no `.env*` file. Nothing to provision to run it.

## Next

### Blocks reactivation — fix before showing the site to anyone

1. **Hub cards render Korean on `/ja` and `/en`.** `lib/projects.ts:19-37`
   stores `title`/`summary` as single Korean strings, and
   `components/home/ProjectsSection.tsx:17` feeds them to every locale.
   Verified live: `/en` shows English badges and headings next to Korean card
   summaries. Fix by deriving cards from the per-locale frontmatter
   (`getAllProjectSlugs` + `getProjectContent` already exist) instead of the
   hand-maintained array.
2. **`/` emits a document with no `<html>`, no `<title>` and no content.**
   `app/layout.tsx:6` returns `children` bare, so the client-only redirect in
   `app/page.tsx` has no shell. `out/index.html` is 5.5 KB of script tags.
   Crawlers and link previews of the canonical URL see nothing. Fix with a
   real rendered page at `/` or a Cloudflare Pages `_redirects` entry.
3. **Every page is titled `imysh`; no OG, Twitter or canonical tags.**
   `app/[locale]/layout.tsx:34-42` sets one static title and no
   `metadataBase`, and the detail route defines no `generateMetadata`.
   Verified: `out/ko/projects/everyai.html` → `<title>imysh</title>`. The
   emitted `hreflang` hrefs are relative (`/ko/`), which is invalid.
4. **The everyai page ships 3.1 MB of GIFs.** 12 R2 images, 140-361 KB each,
   with no `loading="lazy"`, no width/height and no `Cache-Control` on the
   bucket (ETag only). `components/projects/ProjectContent.tsx:52-66`.
5. **Two color tokens fail WCAG AA badly where they carry meaning.** Measured:
   `sage #7a9b76` on `snow` = 2.95:1 (used for the "Live" link and the active
   locale) and `mid-gray #9e9a96` on `snow` = 2.66:1 (card period, figcaption).
   `dark-sage #5a7a56` measures 4.59:1 — use it for sage-colored *text* and
   keep sage for fills and borders.
6. **Two of the three project pages are near-empty** (kigaru 48 lines,
   kaouranai 24 lines, no images, no `liveUrl`). Carried over from the
   2026-10-10 repo scan.
7. **The kigaru detail page prints raw markdown table syntax.** Confirmed on
   the live site under "결과물 — WHAT": `| 기능 | 설명 |` and the separator row
   render as text. Cause confirmed in code: `ProjectContent.tsx:1,89` uses
   `MDXRemote` from `next-mdx-remote/rsc` with **no remark plugins and no
   options**, and `remark-gfm` is not a dependency — MDX core does not support
   GFM tables. It is the first card on the hub, so this reads as a bug, not as
   unfinished content. Fix by passing `remarkGfm` through `mdxOptions`, or by
   dropping MDX for plain remark (content uses no MDX features).
8. **Every everyai GIF carries a screen-recorder watermark, and two show the
   devtools panel.** "Bandisoft.com" is burned into the top-left of all 12,
   and the login / social-login clips include an open Chrome devtools pane.
   They are 1920px recordings scaled down, so at phone width (327x184) the
   text inside them is unreadable. This is the one finished case study, shown
   to recruiters — it undercuts the work it is meant to show. Not visible from
   the code; found by looking at the rendered page.
9. **Korean breaks mid-word.** Observed on the hub cards and in detail body
   text at both 1440 and 375 ("있/는", "플랫/폼", "로/그인"), worst at phone
   width. Cause confirmed: no `word-break`, `break-keep`, `word-wrap` or
   `overflow-wrap` anywhere in `app/` or `components/`. Korean needs
   `word-break: keep-all` (plus `overflow-wrap: break-word` for long tokens);
   the default breaks CJK at any character.

### Worth doing while reopening

7. **Collapse the two-source data model.** `lib/projects.ts` PROJECTS and
   `content/projects/<slug>/<locale>.md` frontmatter duplicate all nine
   fields, and they have already drifted: PROJECTS `title: "EveryAI"` vs
   frontmatter `"EveryAI - AI 작품·서비스 거래 플랫폼"`. Nothing validates that
   the two agree. This also fixes item 1 for free.
8. **Validate frontmatter instead of asserting it.** `lib/markdown.ts:36,41`
   do `data as ProjectFrontmatter` on gray-matter's `any`, and
   `components/projects/SubProjectList.tsx:26` casts `status as ProjectStatus`.
   A typo in `status:` ships a badge with an undefined class. `strict` is on
   but buys nothing here.
9. **Add build-time invariants plus CI** (there are no tests at all): every
   PROJECTS slug has content in 3 locales, every frontmatter parses, no
   missing locale file. `getProjectContent` currently falls back to `ko.md`
   silently, so a missing `en.md` renders Korean inside `<html lang="en">`.
10. **Fix the `portfolio-page-generator` skill.** Its verification step,
    `npx tsc --noEmit lib/projects.ts`, ignores tsconfig and reports four
    spurious `TS2503` errors on a healthy repo (the correct
    `npx tsc --noEmit -p tsconfig.json` exits 0). Its placeholder-ordering
    rule refers to entries deleted in `2311d4b`. And it still writes
    Korean-only card data into PROJECTS, i.e. it reproduces item 1.
11. **`ProjectNav` overflows at phone width.** `ProjectNav.tsx:34-58` puts
    three links in a `flex` row with no `flex-wrap`.
12. **Prose lines are ~114 characters.** The detail container is 960px with
    `px-6` (≈912px of text) and `ProjectContent`'s `<article>` sets no
    max-width. Target ~65ch for the body column.
13. **No focus-visible styles anywhere** (nor `prefers-reduced-motion`, nor a
    skip link) — grep finds zero occurrences across `app/` and `components/`.
14. **Move to role-based color tokens.** `app/globals.css:4-20` names tokens
    after colors (`snow`, `charcoal`), so dark mode would make `bg-snow` mean
    a dark color. See the dark-mode note below.
15. Smaller structural cleanups: `order` is dead on the hub (only
    `lib/markdown.ts:87` reads it, hub uses array order); the locale list is
    duplicated in five places; `max-w-[960px] px-6` in four; `SOCIAL_LINKS` in
    both `Footer.tsx:4` and `HeroSection.tsx:7`; two different h2 sizes for the
    same level (`ProjectsSection` 24/30px vs `SubProjectList` 20px);
    `liveUrl` is never set anywhere, so `ProjectHeader.tsx:54-64` is dead.
16. Accessibility details: MDX `alt` is duplicated into `<figcaption>` so
    screen readers announce it twice; the card thumbnail's `alt` repeats the
    adjacent `<h3>`; the initials-fallback card puts `aria-label` on a plain
    `<span>` (a no-op) at 1.54:1 contrast.
17. Write a `README.md` — for a portfolio repo, the repo is part of the
    portfolio.

### Content work (unchanged from the repo scan)

18. **Migrate the remaining past project(s)** — `spec.md` assumed three
   projects; everyai is the only migrated one. Use the in-repo skill
   `.claude/skills/portfolio-page-generator/SKILL.md` (paste a
   `portfolio-*.md`, it writes ko/ja/en + inserts into `PROJECTS` + verifies
   the build).
19. **Fill in kigaru and kaouranai** — screenshots, a real `liveUrl`
    (`kigaru.pages.dev` per spec), and a repo-level `githubUrl`. These two
    pages are the weakest thing a visitor currently sees.
20. **Decide the image hosting story** — either commit thumbnails/screenshots
    under `public/images/projects/` or accept the R2 bucket as a dependency
    and write it down.

### Cosmetic or later

- The spec's page-transition fade was never implemented (no keyframes, no
  animate utilities anywhere). No scroll animation, which is per spec.
- `getSubProjects` only scans one level down, so a depth-3 project would
  build a reachable page with nothing linking to it.
- `next-mdx-remote/rsc` parses `{` in content as JSX, so a stray brace in a
  markdown file breaks the build. Nothing in `content/` uses MDX features —
  plain remark would be safer now that content is the main remaining work.
- No code-block syntax highlighting (JetBrains Mono only).
- `TechTag` is 12px, below the spec's 13px caption floor.
- Pretendard loads via a jsdelivr `<link>` in the locale layout rather than
  `next/font`, so KO gets a FOUT that JA/EN do not.
- Nine stale `.gitkeep` files in directories that now have real content.

Then, from the Phase 2 backlog in `prompt_plan.md`: custom domain, dark
mode, dynamic OG images, analytics.

## Audit notes (2026-10-10)

**Design decisions — do they still hold in the code?**

- Sage Green ≤10% as a point color: **holds.** Its only filled use is
  `StatusBadge` `deployed`; otherwise a 4px left border on MDX h2, link
  hovers and the active locale.
- Animation limited to page fade + card hover shadow, no scroll animation:
  **partly.** No scroll animation (correct) and the card has
  `hover:shadow-md hover:-translate-y-0.5`, but the page-transition fade was
  never built.
- About removed, Contact folded into the Hero: **holds**, though the same
  `SOCIAL_LINKS` array is repeated in the Footer, so contact appears twice.
- Type scale has drifted upward from `spec.md` §3.2: Hero is
  `text-4xl md:text-5xl` (36/48px) where the spec said 28/40px; section h2 is
  24/30px where the spec said 22/28px.

**Dark mode cost: moderate, and it is the token names, not the
architecture.** `@theme` in `app/globals.css` defines palette-literal names
(`--color-snow`, `--color-charcoal`), and all 13 components reference them
directly, so a dark theme would leave `bg-snow` meaning a dark surface. The
cheap path is to add role tokens (`--color-bg`, `--color-surface`,
`--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`)
mapped to today's palette, migrate classNames once, and then dark mode is a
small override block. `body` colors are also set in plain CSS
(`app/globals.css:23-26`), which is one more place to touch.

**Measured contrast (WCAG 2.1, computed from the tokens):** charcoal/snow
13.57, dark-gray/snow 8.89, dark-sage/snow 4.59 — pass. taupe/snow 3.77,
taupe/light-lavender 3.41, white/sage 3.10 — fail AA for small text.
sage/snow 2.95, mid-gray/snow 2.66, mid-gray/light-lavender 2.40,
lavender/light-lavender 1.54 — fail at every size.

**i18n length risk.** Nothing in the codebase uses `truncate`,
`line-clamp` or `whitespace-nowrap`, so no locale clips text — instead
cards grow, which makes the 2- and 3-column grid ragged (everyai has 7 stack
tags, kigaru 5). The real single-line assumption is `ProjectNav`'s unwrapped
flex row.

**Needs a human or a screenshot to settle** (these are judgement calls, not
facts readable from the source): whether the muted palette reads as calm or
as washed out; whether the ragged card heights look broken in the 2-column
grid; whether 114-character prose lines actually feel too wide; whether the
kigaru initials-fallback card looks intentional or like a broken image;
whether the sticky nav's `bg-snow/80 backdrop-blur-sm` reads cleanly over
scrolling content; and the real mobile rendering of `ProjectNav` at 375px.

### Visual audit, 2026-10-10 (rendered site, read by a human)

Run at exactly 1440x900 and 375x812 frames, KO/JA/EN hub plus detail pages.
Not a real phone, so touch behaviour, mobile browsers and device pixel
density are still unverified. Contrast figures were measured off the rendered
colors, independently of the token arithmetic below.

**Confirmed by both passes** (code-side prediction matched what renders):
the Korean cards on `/ja` and `/en`; the contrast failures, to the decimal
(2.66 dates/captions, 3.41 tags/footer, 3.10 white-on-sage badge, 3.77
tagline, ~2.98 active locale); EN body lines at 100-113 characters; the page
fade that was never implemented; the card hover lifting ~2px, which deviates
from the recorded "shadow only" rule; Sage held to 1-2% of the surface, well
inside its 10% budget.

**Corrected by the pixels** — three code-side calls were wrong:
- `ProjectNav` at 375px does **not** overflow. No horizontal scroll and
  nothing clipped anywhere at phone width. The real phone-width problem is
  hit-target size: the KO/JA/EN switcher is 16-19x20px, social icons 20x20
  (18x18 in the footer), prev/next links 20px tall — all under the 24px
  minimum, far under the 44px ideal. The code pass never checked target size.
- The initials fallback card reads as a deliberate empty state, not as a
  broken image, despite its 1.54:1 contrast. Lower priority than computed.
- Spacing is **not** uniform: the hub runs 96 / 160 / 64px and the 160px band
  between the intro and "Projects" sticks out, pushing the cards below the
  fold at 1440x900. The code pass read the 8px grid and `py-16` and concluded
  the rhythm was consistent; it is consistent per component and not down the
  page.

**Only the pixels caught these** (beyond blocking items 7-9):
- **First impression does not state a role.** Five seconds gives "someone
  called imysh who uses Next.js, React, FastAPI". Front-end, back-end or
  full-stack appears nowhere — and the flagship project, everyai, is a
  Java/Spring back end while Java and Spring are absent from the top tags.
  The first impression and the main work point at two different people. This
  is a positioning problem, not a code one, and it is the most valuable thing
  the visual pass produced.
- The highest-saturation element on the first screen is the blue EveryAI
  logo, which pulls the eye before anything in the actual design system.
- At 1440 the third grid column is empty, which is where thin content shows
  most; at 948px and phone width it reads as full.
- JA renders in system fonts. Cause found: `Noto_Sans_JP` is loaded with
  `subsets: ["latin"]` (`app/[locale]/layout.tsx:15-19`), so the Japanese
  glyphs are not in the subset at all. EN was also reported as system font,
  but `font-inter` is wired correctly (`localeFontClass` on the inner div,
  `--next-inter` on `<body>`), so that one needs a computed-font check before
  it is treated as a defect.
- Focus rings exist on every link and button, but they are the browser
  default blue rather than anything in the design system — consistent with
  zero `focus-visible` rules in the codebase.
- Twelve autoplaying GIFs make the everyai page feel restless even though
  there is no scroll animation, so rule 2 and the "calm tone" goal are broken
  in effect if not in code. Nothing handles `prefers-reduced-motion`.
- Polish inconsistencies: prev/next arrows point the wrong way on one side,
  everyai numbers its sections and kigaru does not, only kigaru has a GitHub
  link, detail H2 and H3 differ by 2px, the status label means different
  things per locale (배포 완료 / Deployed / 公開中 = "now public"), and the KO
  hub alone keeps the English heading "Projects".

**The question that could have overturned the verdict is answered: it does
not.** The low-contrast palette reads as calm, not as washed-out or
unfinished. What reads as unfinished is the broken table, the untranslated
cards and the watermarked GIFs — bugs, not the design. So the verdict stands:
the foundation is worth building on. But "just add content" is wrong — the
five pre-content fixes are the translations, the table rendering, Korean word
breaking, the GIFs, and secondary-text contrast.

## Log
- 2026-10-10: **Design and structure audit, code pass plus a human looking at the rendered site; verdict is that the foundation holds and reopening is finish work, not a rebuild.** Nine blocking items, of which the pixels found three the code could not see: the kigaru detail page printing raw markdown table syntax (cause: `MDXRemote` with no `remark-gfm`), a screen-recorder watermark burned into all 12 everyai GIFs with devtools visible in two, and Korean breaking mid-word (cause: no `word-break: keep-all` anywhere). The pixels also corrected three code-side calls — `ProjectNav` does not overflow at 375px (the real problem is 16-20px hit targets), the initials fallback reads as intentional, and page spacing is not uniform (a 160px band pushes the cards below the fold). Contrast matched to the decimal across both passes: 6 of 11 token pairs fail. The decisive question — whether the low-contrast palette reads as calm or as unfinished — came back "calm", so the design decisions stand and what reads unfinished is bugs. Also recorded: the first screen states no role at all while the flagship project is a Java/Spring back end whose stack is missing from the top tags.

- 2026-10-10: Design + structure audit ahead of a possible reactivation.
  Foundation judged sound (builds, type-checks and lints clean; routing and
  spacing consistent), but six defects block showing the site: Korean card
  summaries on `/ja` and `/en`, a contentless `/` document, one static
  `<title>` with no OG tags, 3.1 MB of un-lazied GIFs on the everyai page,
  two text tokens under 3:1 contrast, and two near-empty project pages. The
  two-source PROJECTS/frontmatter model is the one architectural fix and has
  already drifted. The in-repo skill's type-check step is also broken. No
  product code changed.
- 2026-10-10: Repo scanned for a SecondBrain vault record (intent, state,
  results, stack, resume path, decisions). Verified build + lint pass and
  that imysh.pages.dev is live and current with commit `0f6226a`. Created
  this file; no source changes.
