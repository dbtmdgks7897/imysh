# imysh — progress

## Where things stand (2026-10-10)

**The site's purpose changed, and a redesign is approved.** imysh is no longer
a recruiter portfolio. It is a site that says **what kind of person I am**, for
people in **Japan** who meet me (e.g. the Japanese study group I lead). The
identity is **a maker**, not a job title. Locales become **`ja` (default) +
`ko`**; `en` is dropped (no current audience; next-intl stays, so re-adding it
is cheap). The page leads with "now" (いま), then the path that formed it
(ここまで), with projects as evidence.

- Design spec (approved): [`docs/superpowers/specs/2026-10-10-imysh-redesign-design.md`](superpowers/specs/2026-10-10-imysh-redesign-design.md)
- Visual direction: **C3 · やわらかい索引** (soft index — table-structured path,
  photos per row, rounded gothic, warm neutral ground, one terracotta accent).
  Artboard in https://claude.ai/artifact/Tr3MugFgFgucQyGEor13pb.
- **Phase 1 (Foundation) is implemented on local branch `redesign`, uncommitted
  and unpushed** (plan: [`docs/superpowers/plans/2026-10-10-imysh-phase1-foundation.md`](superpowers/plans/2026-10-10-imysh-phase1-foundation.md)).
  Every plan verification passed locally: content check (positive and the
  deliberately broken copies), lint, `typecheck` (`next typegen` + tsc), a clean
  `npm ci` → build run, and the `out/` greps. The build now emits 9 pages
  (`/ja`, `/ko`, 3 project slugs × 2, `/_not-found`); no `/` and no `/en`.
  What changed: `ja` default + `ko`, `en` removed; `public/_redirects`
  (`/` → `/ja` 302, `/en*` → `/ja*` 301); one zod-validated content model
  (`content/projects/<slug>/meta.yaml` + `{ja,ko}.md`, `lib/content/`,
  `npm run check:content`, also run at build time); placeholder
  `content/now.*.yaml` / `content/path.*.yaml` (validated, not rendered);
  remark + remark-gfm instead of next-mdx-remote (kigaru tables render);
  per-page title / description / canonical / absolute hreflang / OG; GitHub
  Actions CI (`.github/workflows/ci.yml`); the in-repo skill and `CLAUDE.md`
  rewritten. Rendered className sets are identical to the live site apart
  from the removed Inter font variable.
- **Detail-page template B decided** (Phase 2 builds it): big hero image, left
  info card (period, role, stack, mini timeline of neighbouring path nodes),
  right column 01 why / 02 what / 03 what I thought, tech details in
  `<details>`, prev/next at the bottom. Recorded in spec §3.

The live site is unchanged: <https://imysh.pages.dev>, auto-deployed from
`github.com/dbtmdgks7897/imysh` `main`. Local `main` is 1 commit ahead of
`origin/main` (the audit commit `52b8859`, unpushed). Push is not approved
yet, so the Cloudflare preview checks (`_redirects` 302/301 behaviour, CI run)
have not happened, and the Cloudflare Pages Node version is unchecked (CI pins 22).

Verified against the code while planning (these correct the spec; full list
in the plan's "Where the spec disagrees with the code"):

- There is no next-intl routing config or middleware. "Default locale" is only
  the `?? "ko"` fallback in `lib/i18n.ts` and the client redirect in
  `app/page.tsx`; the locale list is hard-coded in four files.
- `tsc -p tsconfig.json --noEmit` needs `next typegen` first on a fresh CI
  checkout (tsconfig includes `.next/types`).
- The spec's path rows reference slugs that do not exist yet
  (my-asset-manager, kigaru/jihanki, imysh, second-brain), so Phase 1
  placeholders link only everyai and kigaru/kaouranai.
- All images are still remote R2 URLs; "every referenced image exists" can only
  be enforced for local `/images/...` paths until Phase 3.
- `/en/*` URLs are live; the plan adds 301s to `/ja/*` in `public/_redirects`.
- The Noto Sans JP `subsets: ["latin"]` diagnosis is unverified (`subsets`
  controls preloading); moot once Phase 2 switches ja to Zen Maru Gothic.

### Content state (text unchanged; en files deleted, structure moved to meta.yaml)

| Project | Content | Notes |
|---|---|---|
| `kigaru` (order 1) | 48-line ko.md + ja.md | Thin. No screenshots, no live URL, `links.github` is the profile root. Tables now render (on `redesign`). |
| `kigaru/kaouranai` (sub) | 24-line ko.md + ja.md | Thinnest page. No images, no links. |
| `everyai` (order 2) | 94-line ko.md + ja.md | The one complete case study; 12 watermarked R2 GIFs (3.1 MB). |

### Known gaps (unchanged)

- Every image is an external Cloudflare R2 URL; `public/images/projects/` holds
  only `.gitkeep`. The spec decides to commit images to the repo (Phase 3).
- No test runner (explicitly not planned, spec §2.11). CI exists on `redesign`
  but has never run (not pushed).
- No `README.md`. No environment variables anywhere.

## Next

Four phases (spec §7). Work happens on branch `redesign`; Cloudflare Pages
preview URLs are used for review; `main` is merged once, after Phase 3. Owner
split: code by a subagent in this repo; copy, photos, everyai screenshots and
publication-scope calls by the user. Numbers in brackets refer to the audit
items below.

### Phase 1 — Foundation (implemented locally on `redesign`, uncommitted)

Plan: `docs/superpowers/plans/2026-10-10-imysh-phase1-foundation.md`.

- [x] Create branch `redesign` from local `main`.
- [x] Drop `en`, make `ja` the default, `public/_redirects` for `/` → `/ja`
  (302) and `/en*` → `/ja*` (301) [2].
- [x] One validated content model: `content/projects/<slug>/meta.yaml` +
  `{ja,ko}.md`, zod schemas, `npm run check:content`, validation at build
  time; delete `PROJECTS` and `lib/markdown.ts` [1, 10, 11, 12, 18 partly].
- [x] Placeholder `content/now.*.yaml` / `content/path.*.yaml` (C3 draft
  Japanese copy; Korean marked as draft), validated but not rendered.
- [x] remark + remark-gfm instead of next-mdx-remote [7].
- [x] `generateMetadata`: title, description, canonical, absolute hreflang, OG [3].
- [x] GitHub Actions CI: lint, typecheck, content check, build [12].
- [x] Rewrite `.claude/skills/portfolio-page-generator/SKILL.md` and
  `CLAUDE.md` for the new model [13].
- [ ] Review the uncommitted changes and commit on `redesign` (command post).
- [ ] Push `redesign` (needs approval), then on the Cloudflare preview: `/`
  returns 302 → `/ja`, `/en/projects/kigaru` returns 301 → `/ja/projects/kigaru`,
  kigaru tables render; CI run is green (`gh run list --branch redesign`).
- [ ] Check the Cloudflare Pages build Node version (Settings → Builds) against
  CI's Node 22.

### Phase 2 — Visual (C3)

- [ ] Role tokens from spec §4 replace palette tokens [5, 17].
- [ ] "01 いま" section and "02 ここまで" path table with sub-rows.
- [ ] Detail page template B (spec §3): hero image, left info card with mini
  path timeline, right column 01 why / 02 what / 03 what I thought, tech
  details in `<details>`, prev/next at the bottom.
- [ ] Typography: Zen Maru Gothic (ja) and Pretendard (ko) via `next/font`;
  `word-break: keep-all` for Korean, `line-break: strict` for Japanese; body
  column ≈40em [9, 15].
- [ ] A11y floor: text ≥4.5:1, touch targets ≥44px on mobile, `focus-visible`
  ring, `prefers-reduced-motion`, card hover shadow only [16, 19, 21].
- [ ] ProjectNav arrow direction; remaining structural cleanups [14, 18].

### Phase 3 — Content

- [ ] Korean drafts from the vault → user review → Japanese translation → user review.
- [ ] New pages: my-asset-manager, kigaru/jihanki, second-brain, imysh [22].
- [ ] Rewrite everyai with 3–4 static screenshots replacing the GIFs [4, 8];
  fill kigaru and kaouranai [6, 23].
- [ ] Commit images under `public/images/`, `npm run images` (sharp, two webp
  widths), `width`/`height` + `loading="lazy"` [24].
- [ ] README [20].
- [ ] Open items (spec §8): jihanki slug, which photos exist, public scope
  (study venue/city, employer names, talking-bar wording), the two inferred
  hand-off lines, My Asset Manager facts marked 추정.

### Phase 4 — Pre-launch

- [ ] Real phone, OG previews, Lighthouse; then merge `redesign` into `main`.

### Audit items (reference, 2026-10-10)

The audit findings that the phases above resolve, renumbered 1–24 in one
sequence. The phase each one belongs to is in brackets.


#### Blocks reactivation — fix before showing the site to anyone

1. [Phase 1] **Hub cards render Korean on `/ja` and `/en`.** `lib/projects.ts:19-37`
   stores `title`/`summary` as single Korean strings, and
   `components/home/ProjectsSection.tsx:17` feeds them to every locale.
   Verified live: `/en` shows English badges and headings next to Korean card
   summaries. Fix by deriving cards from the per-locale frontmatter
   (`getAllProjectSlugs` + `getProjectContent` already exist) instead of the
   hand-maintained array.
2. [Phase 1] **`/` emits a document with no `<html>`, no `<title>` and no content.**
   `app/layout.tsx:6` returns `children` bare, so the client-only redirect in
   `app/page.tsx` has no shell. `out/index.html` is 5.5 KB of script tags.
   Crawlers and link previews of the canonical URL see nothing. Fix with a
   real rendered page at `/` or a Cloudflare Pages `_redirects` entry.
3. [Phase 1] **Every page is titled `imysh`; no OG, Twitter or canonical tags.**
   `app/[locale]/layout.tsx:34-42` sets one static title and no
   `metadataBase`, and the detail route defines no `generateMetadata`.
   Verified: `out/ko/projects/everyai.html` → `<title>imysh</title>`. The
   emitted `hreflang` hrefs are relative (`/ko/`), which is invalid.
4. [Phase 3] **The everyai page ships 3.1 MB of GIFs.** 12 R2 images, 140-361 KB each,
   with no `loading="lazy"`, no width/height and no `Cache-Control` on the
   bucket (ETag only). `components/projects/ProjectContent.tsx:52-66`.
5. [Phase 2] **Two color tokens fail WCAG AA badly where they carry meaning.** Measured:
   `sage #7a9b76` on `snow` = 2.95:1 (used for the "Live" link and the active
   locale) and `mid-gray #9e9a96` on `snow` = 2.66:1 (card period, figcaption).
   `dark-sage #5a7a56` measures 4.59:1 — use it for sage-colored *text* and
   keep sage for fills and borders.
6. [Phase 3] **Two of the three project pages are near-empty** (kigaru 48 lines,
   kaouranai 24 lines, no images, no `liveUrl`). Carried over from the
   2026-10-10 repo scan.
7. [Phase 1] **The kigaru detail page prints raw markdown table syntax.** Confirmed on
   the live site under "결과물 — WHAT": `| 기능 | 설명 |` and the separator row
   render as text. Cause confirmed in code: `ProjectContent.tsx:1,89` uses
   `MDXRemote` from `next-mdx-remote/rsc` with **no remark plugins and no
   options**, and `remark-gfm` is not a dependency — MDX core does not support
   GFM tables. It is the first card on the hub, so this reads as a bug, not as
   unfinished content. Fix by passing `remarkGfm` through `mdxOptions`, or by
   dropping MDX for plain remark (content uses no MDX features).
8. [Phase 3] **Every everyai GIF carries a screen-recorder watermark, and two show the
   devtools panel.** "Bandisoft.com" is burned into the top-left of all 12,
   and the login / social-login clips include an open Chrome devtools pane.
   They are 1920px recordings scaled down, so at phone width (327x184) the
   text inside them is unreadable. This is the one finished case study, shown
   to recruiters — it undercuts the work it is meant to show. Not visible from
   the code; found by looking at the rendered page.
9. [Phase 2] **Korean breaks mid-word.** Observed on the hub cards and in detail body
   text at both 1440 and 375 ("있/는", "플랫/폼", "로/그인"), worst at phone
   width. Cause confirmed: no `word-break`, `break-keep`, `word-wrap` or
   `overflow-wrap` anywhere in `app/` or `components/`. Korean needs
   `word-break: keep-all` (plus `overflow-wrap: break-word` for long tokens);
   the default breaks CJK at any character.

#### Worth doing while reopening

10. [Phase 1] **Collapse the two-source data model.** `lib/projects.ts` PROJECTS and
   `content/projects/<slug>/<locale>.md` frontmatter duplicate all nine
   fields, and they have already drifted: PROJECTS `title: "EveryAI"` vs
   frontmatter `"EveryAI - AI 작품·서비스 거래 플랫폼"`. Nothing validates that
   the two agree. This also fixes item 1 for free.
11. [Phase 1] **Validate frontmatter instead of asserting it.** `lib/markdown.ts:36,41`
   do `data as ProjectFrontmatter` on gray-matter's `any`, and
   `components/projects/SubProjectList.tsx:26` casts `status as ProjectStatus`.
   A typo in `status:` ships a badge with an undefined class. `strict` is on
   but buys nothing here.
12. [Phase 1] **Add build-time invariants plus CI** (there are no tests at all): every
   PROJECTS slug has content in 3 locales, every frontmatter parses, no
   missing locale file. `getProjectContent` currently falls back to `ko.md`
   silently, so a missing `en.md` renders Korean inside `<html lang="en">`.
13. [Phase 1] **Fix the `portfolio-page-generator` skill.** Its verification step,
    `npx tsc --noEmit lib/projects.ts`, ignores tsconfig and reports four
    spurious `TS2503` errors on a healthy repo (the correct
    `npx tsc --noEmit -p tsconfig.json` exits 0). Its placeholder-ordering
    rule refers to entries deleted in `2311d4b`. And it still writes
    Korean-only card data into PROJECTS, i.e. it reproduces item 1.
14. [Phase 2] **`ProjectNav` overflows at phone width** — corrected by the visual audit: it does not overflow at 375px; the real issue is item 21 (and the arrow direction). `ProjectNav.tsx:34-58` puts
    three links in a `flex` row with no `flex-wrap`.
15. [Phase 2] **Prose lines are ~114 characters.** The detail container is 960px with
    `px-6` (≈912px of text) and `ProjectContent`'s `<article>` sets no
    max-width. Target ~65ch for the body column.
16. [Phase 2] **No focus-visible styles anywhere** (nor `prefers-reduced-motion`, nor a
    skip link) — grep finds zero occurrences across `app/` and `components/`.
17. [Phase 2] **Move to role-based color tokens.** `app/globals.css:4-20` names tokens
    after colors (`snow`, `charcoal`), so dark mode would make `bg-snow` mean
    a dark color. See the dark-mode note below.
18. [Phase 1–2] Smaller structural cleanups: `order` is dead on the hub (only
    `lib/markdown.ts:87` reads it, hub uses array order); the locale list is
    duplicated in five places; `max-w-[960px] px-6` in four; `SOCIAL_LINKS` in
    both `Footer.tsx:4` and `HeroSection.tsx:7`; two different h2 sizes for the
    same level (`ProjectsSection` 24/30px vs `SubProjectList` 20px);
    `liveUrl` is never set anywhere, so `ProjectHeader.tsx:54-64` is dead.
19. [Phase 2] Accessibility details: MDX `alt` is duplicated into `<figcaption>` so
    screen readers announce it twice; the card thumbnail's `alt` repeats the
    adjacent `<h3>`; the initials-fallback card puts `aria-label` on a plain
    `<span>` (a no-op) at 1.54:1 contrast.
20. [Phase 3] Write a `README.md` — for a portfolio repo, the repo is part of the
    portfolio.
21. [Phase 2] **Touch targets are 16-20px.** Found by the visual audit at
    375px: the KO/JA/EN switcher is 16-19x20px, social icons 20x20 (18x18 in
    the footer), prev/next links 20px tall — under the 24px minimum (WCAG 2.2
    AA) and far under the 44px target the spec sets for mobile.

#### Content work (unchanged from the repo scan)

22. [Phase 3] **Migrate the remaining past project(s)** — `spec.md` assumed three
   projects; everyai is the only migrated one. Use the in-repo skill
   `.claude/skills/portfolio-page-generator/SKILL.md` (paste a
   `portfolio-*.md`, it writes ko/ja/en + inserts into `PROJECTS` + verifies
   the build).
23. [Phase 3] **Fill in kigaru and kaouranai** — screenshots, a real `liveUrl`
    (`kigaru.pages.dev` per spec), and a repo-level `githubUrl`. These two
    pages are the weakest thing a visitor currently sees.
24. [Phase 3] **Decide the image hosting story** — decided: images are committed to the repo (spec §2.10). The options were: either commit thumbnails/screenshots
    under `public/images/projects/` or accept the R2 bucket as a dependency
    and write it down.

#### Cosmetic or later

- Decided by the spec: the page-transition fade is dropped, not deferred;
  dark mode, CMS and vault sync are not planned (spec §2.11).
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
- 2026-10-10: **Implemented Phase 1 (Foundation) on local branch `redesign`, uncommitted and unpushed.** ja default + ko (en removed, `_redirects` for `/` and `/en*`), one zod-validated content model with `npm run check:content` and build-time validation, placeholder now/path content, remark + remark-gfm (kigaru tables now render), per-page canonical / absolute hreflang / OG metadata, GitHub Actions CI, rewritten skill and CLAUDE.md. All plan verifications passed locally; the md migration was proven verbatim (diff contains only removed structural frontmatter keys). One small change from the plan: `loadProjectText` was split out of `loadProject` so a missing meta.yaml no longer hides frontmatter errors (plan updated to match). Recorded detail template B in spec §3. Preview-URL checks wait for push approval.
- 2026-10-10: **Wrote the Phase 1 (Foundation) implementation plan** for the approved redesign (purpose changed to a "who I am" site for people in Japan, maker identity, ja default + ko, en dropped, visual C3): `docs/superpowers/plans/2026-10-10-imysh-phase1-foundation.md`, 8 tasks with exact code, migration commands and output greps. Facts checked against the code and a scratch install, not the spec: no next-intl routing config exists (default locale is a fallback in `lib/i18n.ts` + the client redirect in `app/page.tsx`); CI typecheck needs `next typegen` first; spec path rows reference four slugs that do not exist yet; images are all remote R2; live `/en/*` URLs need 301s. The proposed zod schemas were parsed against the placeholder YAML, and the remark/hast renderer typing compiled under strict. Rewrote this file's status and replaced the old ordering in `## Next` with the spec's four phases, audit items renumbered 1–24 with phase tags (adds the touch-target item). No product code changed; branch `redesign` not created.
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
