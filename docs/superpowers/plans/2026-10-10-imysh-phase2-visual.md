# imysh Phase 2 — Visual (C3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the site its C3 face — role tokens, self-hosted Zen Maru Gothic / Pretendard, the "01 いま" + "02 ここまで" hub rendered from `content/now.*` and `content/path.*`, and detail pages in template B — while meeting the a11y floor.

**Architecture:** Tokens live in `app/globals.css` `@theme` as role names only. The hub is two server components (`NowSection`, `PathTable`) fed by the Phase 1 loaders. Detail pages split each locale's markdown into h2 parts and map them to the four fixed sections (`why`, `what`, `tech`, `thought`) through a positional `sections:` list in `meta.yaml`, so the markdown words do not change. A small `lib/content/path-index.ts` connects projects to path nodes (mini timeline, back links, prev/next order).

**Tech Stack:** Next.js 16.1.6 (Turbopack, static export), Tailwind CSS 4 `@theme`, next-intl 4, `@fontsource/zen-maru-gothic`, `pretendard` (npm), `@fontsource/jetbrains-mono`, unified/remark (Phase 1), Playwright (via `npx`, not a dependency) for screenshots.

**Spec:** `docs/superpowers/specs/2026-10-10-imysh-redesign-design.md` (§3 hub + detail template B, §4 visual system, §7 Phase 2). Visual references: `Index3.dc.html` (hub C3) and `DetailSide.dc.html` (detail B) from the design canvas.

## Global Constraints

- Branch `redesign` (at `b53d606` when this plan starts). Do not commit or push; the command post does.
- Role tokens exactly as spec §4: `bg #F7F4EF`, `surface #FFFFFF`, `surface-sub #FBF8F4`, `text #2E2A27`, `text-muted #6A625B`, `text-soft #4A433E`, `border #E3DDD3`, `accent-text #B44A30`, `accent #E9B8A6` (never text), `accent-tint #F6DDD2`, `placeholder #EFE7DE`. All palette-named tokens are removed.
- Fonts are self-hosted from npm, never fetched from Google at build time (CI `/l/font` trap, `fe46a84`). Zen Maru Gothic 400/500/700 for ja, Pretendard for ko, JetBrains Mono for code. Headings 700, never 900. Noto Sans JP, `next/font/google` and the jsdelivr Pretendard `<link>` are removed.
- Korean: `word-break: keep-all; overflow-wrap: break-word`. Japanese: `line-break: strict` (no keep-all — Japanese has no spaces, keep-all would make whole sentences unbreakable). Prose column ≈ 40em.
- Radius 14–20px; cards use a soft shadow, not borders; hover = shadow only (no translate).
- A11y: text ≥4.5:1 (computed below), touch targets ≥44px on mobile, `:focus-visible` ring in `accent-text`, `prefers-reduced-motion` disables transitions/smooth scroll.
- No image → no image cell. Never render grey placeholder boxes on the real site.
- Copy comes from `content/*.yaml`, the md files and `messages/*.json`. Existing project words are not changed; md is only mapped into sections. A section with no content is omitted. UI strings added to `messages/ko.json` are direct Korean renderings of the ja strings.
- Verification: `npm run lint`, `npm run typecheck`, `npm run check:content`, `npm run build`, and Playwright screenshots (ja/ko × 1440/375) under `docs/screenshots/phase2/`.

## Contrast (computed from the tokens, WCAG 2.1)

| fg \ bg | bg | surface | surface-sub | accent-tint |
|---|---|---|---|---|
| text | 12.96 | 14.22 | 13.43 | 10.97 |
| text-muted | 5.45 | 5.98 | 5.65 | 4.61 |
| text-soft | 8.85 | 9.71 | 9.17 | 7.48 |
| accent-text | 4.83 | 5.30 | 5.01 | **4.09** |

`accent-text` on `accent-tint` fails for small text, so it is used only for the large accented h1 phrase (≥24px bold → 3:1 applies). Status pills use `text` on `accent-tint`.

## Design decisions recorded here

1. **Markdown → sections by position.** `meta.yaml` gets `sections: [why, what, tech, thought]` (one entry per h2 in the md, in order; same count in ja and ko, validated). One md part per key → its h2 text is replaced by the section title; several parts with the same key → each keeps its original h2 text as an h3. kigaru: `[why, tech, what, tech, thought]` (HOW and 技術判断 fold into the tech `<details>`); kaouranai: `[why, what, tech]` (no 03 md part); everyai: `[why, what, tech, thought]`. Section titles: 01 なぜ始めたか / 02 何をつくったか / 03 ここで考えたこと; tech is the `<details>` "技術の話をもっと見る".
2. **03 opens with the path node's thought** when the project is on the path (existing copy from `path.*.yaml`), then the md thought part, then a link back to the path row. 03 renders if either exists.
3. **Hero image** is a new optional `meta.yaml` `hero`; no project has one yet, so the hero card is text-only for now (the everyai logo `thumbnail` is not promoted to a hero). Phase 3 adds screenshots.
4. **Info card** shows period, status and stack. "Role" from the artboard is omitted — no existing content carries it (no invented copy). Phase 3 can add a `role` frontmatter key.
5. **Mini timeline**: the flattened path (nodes and sub-nodes), showing the previous, current and next node around the node that lists this project; each links to `/{locale}#path-{id}`; under it the current node's `next` line. Hidden for projects not on the path (kigaru parent).
6. **Prev/next order**: projects in path order (everyai, kigaru/kaouranai), then the rest by depth and `order` (kigaru). Sub-projects also keep the "← parent" link in the hero.
7. **Hub** = 01 いま + 02 ここまで only (spec §3). The old Hero/Projects grid is removed; projects are reached from path rows ("つくったもの →") and from parent/child links.
8. **Path table photo column** is shown only if any node has photos; rows without photos then get an empty cell for alignment (no grey box). Today no node has photos, so the column is absent.
9. **Cards in いま** link to the project page (`project`) or external `href` when set; neither is set today, so they render as non-link cards without images.

## File map

Create: `lib/content/sections.ts`, `lib/content/path-index.ts`, `components/home/NowSection.tsx`, `components/home/PathTable.tsx`, `components/projects/ProjectHero.tsx`, `components/projects/ProjectInfoCard.tsx`, `components/projects/MiniTimeline.tsx`, `components/projects/ProjectSections.tsx`, `components/ui/SocialLinks.tsx`, `docs/screenshots/phase2/*.png`.

Modify: `app/globals.css`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/projects/[...slug]/page.tsx`, `components/layout/{Navigation,LanguageSwitcher,Footer}.tsx`, `components/projects/{ProjectContent,ProjectNav,SubProjectList,ProjectCard}.tsx`, `components/ui/{StatusBadge,TechTag}.tsx`, `lib/content/schema.ts` (`sections`, `hero`), `lib/content/validate.ts` (section checks), `lib/site.ts` (`SOCIAL_LINKS`), `content/projects/*/meta.yaml` (+`sections`), `messages/{ja,ko}.json`, `package.json`, `.claude/skills/portfolio-page-generator/SKILL.md`, `CLAUDE.md`.

Delete: `components/home/HeroSection.tsx`, `components/home/ProjectsSection.tsx`, `components/projects/ProjectHeader.tsx`, stale `.gitkeep` files in non-empty dirs.

---

### Task 1: Tokens, fonts, base CSS

**Files:** `package.json`, `app/globals.css`, `app/[locale]/layout.tsx`

- [ ] `npm uninstall @fontsource/noto-sans-jp && npm install @fontsource/zen-maru-gothic@^5.3.0 @fontsource/jetbrains-mono@^5.3.0 pretendard@^1.3.9`
- [ ] Replace `@theme` with the 11 role colors, `--font-ja: "Zen Maru Gothic", "Pretendard Variable", ui-sans-serif, system-ui, sans-serif`, `--font-ko: "Pretendard Variable", "Zen Maru Gothic", ui-sans-serif, system-ui, sans-serif`, `--font-mono: "JetBrains Mono", ui-monospace, monospace`. Add base layer: body `bg`/`text`, `:lang(ko)` keep-all + overflow-wrap, `:lang(ja)` line-break strict, `:focus-visible` outline 2px `accent-text` offset 3px, `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference`, and a reduce block that kills transitions/animations.
- [ ] Layout: drop `next/font/google`, the Noto imports and the jsdelivr `<link>`; import `@fontsource/zen-maru-gothic/{400,500,700}.css`, `pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css`, `@fontsource/jetbrains-mono/400.css`; font class `font-ja` / `font-ko`.
- [ ] Verify: `npm run build` passes; `grep -rn "fonts.googleapis\|next/font/google\|jsdelivr" app components lib` → nothing; `grep -o 'font-family:[^;]*' out/_next/static/chunks/*.css | sort -u` shows Zen Maru Gothic, Pretendard Variable, JetBrains Mono.

### Task 2: Shell — navigation, language switcher, footer, shared social links

**Files:** `lib/site.ts`, `components/ui/SocialLinks.tsx`, `components/layout/{Navigation,LanguageSwitcher,Footer}.tsx`, `messages/*.json` (`nav`, `footer`)

- [ ] `SOCIAL_LINKS` (GitHub, Email) moves to `lib/site.ts`; `SocialLinks` renders them as 44×44 icon links with `aria-label`.
- [ ] Navigation: dot + "IMYSH" home link, "01 いま" (`/{locale}#now`), "02 ここまで" (`/{locale}#path`), JA/KO switcher; every target `min-h-11 min-w-11`; current locale `aria-current="true"` in `text`, the other in `text-muted`; switcher keeps its `<button>`s.
- [ ] Footer: copyright + `SocialLinks`, `text-muted` on `bg`, top hairline `border`.

### Task 3: Content model additions — sections, hero, path index

**Files:** `lib/content/schema.ts`, `lib/content/sections.ts`, `lib/content/path-index.ts`, `lib/content/validate.ts`, `content/projects/*/meta.yaml`

- [ ] Schema: `SECTION_KEYS = ["why","what","tech","thought"]`; `projectMetaSchema` gains `sections: z.array(z.enum(SECTION_KEYS)).min(1)` and `hero: imageRefSchema.optional()`.
- [ ] `sections.ts`: `splitH2(body) → { preamble: string; parts: { heading: string; content: string }[] }` (fence-aware), `toSections(body, keys) → Partial<Record<SectionKey, string>>` (single part → content; several → each as `### heading` + content).
- [ ] `path-index.ts`: `flattenPath(path)`, `findNodeForProject(path, slug)`, `projectSequence(path, allSlugPaths, metaOf)` for prev/next.
- [ ] Validate: per locale md, `preamble` must be blank and `parts.length === sections.length`; `hero` image checked like `thumbnail`.
- [ ] meta.yaml: everyai `[why, what, tech, thought]`, kigaru `[why, tech, what, tech, thought]`, kaouranai `[why, what, tech]`.
- [ ] Verify: `npm run check:content` passes; a scratch copy with one extra h2 in `everyai/ko.md` fails with a count mismatch.

### Task 4: Hub — 01 いま and 02 ここまで

**Files:** `components/home/NowSection.tsx`, `components/home/PathTable.tsx`, `app/[locale]/page.tsx`, `messages/*.json` (`now`, `path`); delete `HeroSection`, `ProjectsSection`.

- [ ] NowSection (`id="now"`): label "01 — いま / {asOf}", h1 = `before` + `<span accent>` + `after` (accent span: `text-accent-text` with a tint underline gradient), portrait cell only if `portrait`; grid of: thinking lines (label 考えていること), cards (image only if set; `<a>` only if `project`/`href`; else `<div>`), one-liners list with accent dots (label ほかに), `SocialLinks`.
- [ ] PathTable (`id="path"`): label "02 — ここまで", h2 = path `heading`; header row (年 / [写真] / していたこと / そのときの考え / 次へ行った理由) hidden below `md`; each node a `surface` row card `id="path-{id}"` with year label, doing (+ project links "{title} →"), thought (+ thoughtNote), next in `text-soft`; children as `surface-sub` sub-rows indented `ml-6 md:ml-10` that keep the indent when stacked; the `current` node gets the accent outline and its "next" cell is a link "→ 01 いま へ" to `#now`.
- [ ] Verify build; `out/ja.html` contains `id="now"`, `id="path"`, `id="path-2026-a"`, the accent phrase, and no `[사진` / `[이미지` placeholder text.

### Task 5: Detail template B

**Files:** `app/[locale]/projects/[...slug]/page.tsx`, `components/projects/{ProjectHero,ProjectInfoCard,MiniTimeline,ProjectSections,ProjectContent,ProjectNav,SubProjectList,ProjectCard}.tsx`, `components/ui/{StatusBadge,TechTag}.tsx`, `messages/*.json` (`detail`); delete `ProjectHeader`.

- [ ] Hero card (`surface`, radius 28px): back link "← 02 ここまで · {node label}" to `#path-{id}` (or "← {parent title}" for sub-projects not on the path; both when applicable), h1 title, summary in `text-soft`, hero image half only if `meta.hero`; links (GitHub/Live) when set.
- [ ] Two columns (`md:flex`): aside (info card: period, status pill, stack chips; MiniTimeline card) and main (01/02/tech `<details>`/03, children list for gallery parents, back-to-path link, prev/next).
- [ ] ProjectContent restyled to tokens; prose column `max-w-[40em]`; images keep `loading="lazy"`.
- [ ] ProjectNav: two `surface` cards "← 前 / 次 →" with titles, ≥44px, from `projectSequence`.
- [ ] Verify build; `out/ja/projects/everyai.html` contains 01/02/03 titles, `<details`, the path thought 「AIがあれば…」, the mini timeline links `#path-2023`; `out/ja/projects/kigaru/kaouranai.html` has no `ここで考えたこと` md part but shows the node thought; `out/ja/projects/kigaru.html` lists kaouranai.

### Task 6: Cleanup, docs, skill

- [ ] Remove `.gitkeep` files in non-empty directories; grep for palette class names (`snow|lavender|sage|taupe|charcoal|dark-gray|mid-gray`) → nothing.
- [ ] Update `CLAUDE.md` design-system section to the role tokens/fonts/a11y rules; update the skill's `meta.yaml` schema (`sections`, `hero`).

### Task 7: Browser check

- [ ] `npm run build`, serve `out/` locally (`npx serve out` or a tiny static server), capture with Playwright (`npx playwright` + a scratch script): `/ja` and `/ko` hub, `/ja/projects/everyai`, `/ko/projects/kigaru/kaouranai`, at 1440×900 full page and 375×812 full page → `docs/screenshots/phase2/`.
- [ ] Check in the shots: no horizontal scroll at 375 (`scrollWidth === clientWidth`), path rows stacked with sub-row indent, Korean has no mid-word breaks, focus ring visible on Tab, targets ≥44px (measure nav/switcher/social via `getBoundingClientRect`).
- [ ] Compare with `Index3.dc.html` and `DetailSide.dc.html`; list deliberate differences (no placeholders, no role row, no hero image yet).
- [ ] Final: lint, typecheck, check:content, build; update `docs/progress.md`.
