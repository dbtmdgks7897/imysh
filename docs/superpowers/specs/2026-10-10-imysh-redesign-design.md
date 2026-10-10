# imysh redesign — design

Date: 2026-10-10
Status: approved in conversation, pending written-spec review
Source session: dev 오케스트레이션 2026-10-10 (Claude Code, `~/dev` command post)
Visual reference: https://claude.ai/artifact/Tr3MugFgFgucQyGEor13pb (artboard **C3 · やわらかい索引**)

## 1. Why this redesign

The 2026-10-10 audit (see `docs/progress.md`) judged the code foundation sound
but found nine blocking defects. While deciding how to fix them, the purpose
of the site changed, and that change drives everything below:

| | Before (2026-03 spec) | Now |
|---|---|---|
| Purpose | Portfolio for recruiters | A site that says **what kind of person I am** |
| Audience | Recruiters, tech community, collaborators (KO first) | People in **Japan** who meet me (e.g. the Japanese study group I lead) |
| Identity | Unstated; tags suggested front end | A **maker** — not a job title |
| Main content | Projects | Thinking → life → things made, with projects as evidence |

## 2. Decisions

Each decision carries its reason so it can be re-checked without the conversation.

1. **Identity is "maker", not a role.** The user picked "만드는 사람" over
   back-end / full-stack / front-end; the site is not for hiring.
2. **Audience is Japan; default locale `ja`, second `ko`, drop `en`.** Text is
   written in Korean (the vault is Korean) and translated to Japanese. EN has
   no current audience; next-intl stays, so re-adding it is cheap.
3. **Content is curated from the vault, not synced.** Vault notes are written
   for myself (missing context, other people, sensitive projects); public text
   is rewritten for strangers. Translation is already a human gate.
   Rejected: a `publish: true` sync — one scoping mistake cannot be undone once indexed.
4. **Order of meaning: thinking → life → things made.** Thinking shapes life
   choices, which produced the projects.
5. **The page leads with "now", then shows how "now" was formed.** The first
   screen states the current thought and current activities; below it, the path
   runs chronologically from the start and closes back on "now".
   Rejected: reverse chronology — it reads the "why I moved on → next thought"
   causality backwards.
6. **The path is one line, not parallel themes.** The vault's lineage note
   shows a single question evolving through turning points, so chapters per
   theme would split one idea artificially. Each node carries: period, what I
   was doing, the thought at the time, and **why I moved to the next one**.
   The "why I moved on" line is what makes the connection visible.
7. **Project-to-project thought flow is shown, not collapsed.** The 2026
   vibe-coding period expands into sub-nodes (kaouranai → 自販機 → imysh →
   question → Second Brain), each with its own thought and hand-off line.
8. **Reverses the 2026-03 decision "remove About".** Self-introduction is now
   the first two thirds of the page.
9. **Visual: C3 — soft index.** Table-structured path, photos in every row,
   rounded gothic, warm neutral ground, a single terracotta accent.
   Rejected along the way: multi-hue pastel rows (read as tacky), ink +
   vermilion with heavy rules (read as stiff), and A/B/D/E directions.
10. **Images are committed to the repo**, not hosted on R2. The everyai GIFs
    (watermarked, devtools visible, 3.1 MB) are replaced by 3–4 static
    screenshots.
11. **Not doing now:** CMS, vault sync, dark mode, test runner, page-transition
    fade (the 2026-03 spec item is dropped, not deferred).

## 3. Information architecture

### Hub `/{ja,ko}`

1. **01 いま (now)** — first screen
   - Central sentence (2026-09-26 wording): "誰もが、自分が本当に望む価値のために
     生きられるように。それを手伝いたい。" with one accented phrase.
   - Portrait photo beside it.
   - 1–2 lines of current thinking.
   - Cards: **Second Brain**, **YouTube 「面白そうだから」** (image + one line each).
   - One-liners: Japanese study group leader (2026.07–), working on a
     construction site (2026.08–).
   - Contact icons.
2. **02 ここまで (path)** — a table of rows, columns:
   year · photo · what I was doing · the thought then · why I moved on.
   Rows (from `SecondBrain/03-Resources/내 이력 연표 - 2023년 이후 일의 순서.md`):

   | Row | Period | Doing | Project link |
   |---|---|---|---|
   | 2023 | 2023/07–12 | My Asset Manager → everyai (back-end intern) | my-asset-manager, everyai |
   | 2024 | 2024/01–12 | pub · factory · online clothing shop | — |
   | 2025 | 2025/01–2026/05 | cosmetics retail → working holiday in Japan | — |
   | 2026 前半 | 2026 H1 | vibe coding (sub-rows a–d) | see below |
   | 2026-a | | kaouranai | kigaru/kaouranai |
   | 2026-b | | programming vending machine | kigaru/jihanki |
   | 2026-c | | imysh | imysh |
   | 2026-d | | (question → people) Second Brain | second-brain |
   | 2026 後半 | 2026/05– | talking bar → construction site | — |

   The last row links back to 01.

3. Footer.

### Project detail `/{locale}/projects/<slug...>`

Section order: **01 why I started (なぜ始めたか) → 02 what I made
(何をつくったか) → 03 what I thought here (ここで考えたこと) → back to "this
period of me"** (link to its path row). Section 03 ends with where it
stopped or why it continues: stopping is also a thought of that time, and the
site's axis is thinking (decided 2026-10-10).

Pages: `my-asset-manager` (new), `everyai` (rewrite + screenshots),
`kigaru` (gallery parent), `kigaru/kaouranai`, `kigaru/jihanki` (new),
`second-brain` (new), `imysh` (new).

Layout (decided 2026-10-10, template **B**; built in Phase 2): a large hero
image on top; below it a left info card with period, role, stack and a mini
timeline of the neighbouring path nodes, and a right column with 01 why /
02 what / 03 what I thought. Technical details are folded into `<details>`;
prev/next sit at the bottom.

kigaru is a gallery of small, casual content; kaouranai and the programming
vending machine are entries inside it. The hierarchy stays parent → children
via the existing `[...slug]` route.

## 4. Visual system (C3)

Role tokens replace palette-named tokens in `app/globals.css`:

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#F7F4EF` | page ground |
| `--color-surface` | `#FFFFFF` | row cards, project cards |
| `--color-surface-sub` | `#FBF8F4` | sub-row cards |
| `--color-text` | `#2E2A27` | body and headings |
| `--color-text-muted` | `#6A625B` | captions, periods (≥4.5:1 on bg) |
| `--color-text-soft` | `#4A433E` | "why I moved on" lines |
| `--color-border` | `#E3DDD3` | hairlines |
| `--color-accent-text` | `#B44A30` | links, accented phrase (≥4.5:1 on bg) |
| `--color-accent` | `#E9B8A6` | dots, "now" row outline — never text |
| `--color-accent-tint` | `#F6DDD2` | under-highlight of the accented phrase |
| `--color-placeholder` | `#EFE7DE` | image placeholder ground |

- Type: Zen Maru Gothic (400/500/700) for ja; Korean pairs with Pretendard.
  Both are self-hosted from npm (`@fontsource/zen-maru-gothic`, `pretendard`),
  never `next/font/google`: Google can serve CJK fonts as `/l/font?kit=` URLs
  that break the build (2026-10-10, `fe46a84`). Headings 700, never 900.
- Korean: `word-break: keep-all; overflow-wrap: break-word`. Japanese:
  `line-break: strict`. Body column ≈ 40em.
- Shape: radius 14–20px; cards use a soft shadow, not borders.
- Motion: card hover = shadow only; honour `prefers-reduced-motion`.
- A11y floor: text contrast ≥4.5:1, touch targets ≥44px on mobile,
  `focus-visible` ring in `--color-accent-text`.
- Phone width: table rows stack to one column; sub-rows keep their indent.

## 5. Data model

Principle: **structure in one place, sentences per locale.**

```
content/
  now.yaml                  cards (slug, image, href), one-liner order
  now.{ja,ko}.yaml          central sentence, thinking lines, card/one-liner text
  path.yaml                 nodes: id, period, photos[], projects[], children[]
  path.{ja,ko}.yaml         per node id: doing, thought, next
  projects/<slug>/meta.yaml period, stack, images, links, status
  projects/<slug>/{ja,ko}.md  body: why → what → stopped/continuing
```

- `lib/projects.ts` `PROJECTS` is deleted; cards derive from `meta.yaml` +
  locale files. This removes the drift and the KO-on-`/ja` bug at the root.
- Build-time validation with zod: every structural id has text in **both**
  locales (no silent fallback to another locale); every project slug and
  image referenced exists; enums (`status`) are closed.
- Markdown: drop `next-mdx-remote`; render with `remark` + `remark-gfm`
  (fixes raw table output and the `{` build hazard).
- Images: `public/images/...`; `npm run images` (sharp) pre-generates two
  webp widths; markup sets `width`/`height` and `loading="lazy"`.
- Routing: remove `en`; default `ja`; `public/_redirects` sends `/` → `/ja`
  (302). `generateMetadata` per page: title, description, OG, canonical,
  absolute `hreflang` for ja/ko, `metadataBase`.
- CI: GitHub Actions runs `lint`, `tsc -p tsconfig.json --noEmit`, `build`.
- The in-repo skill `.claude/skills/portfolio-page-generator` is rewritten to
  the new model (it currently writes Korean-only card data and uses a broken
  type-check command).

## 6. Where each audit blocker is resolved

| # | Blocker | Resolved by |
|---|---|---|
| 1 | KO cards on `/ja` | §5 single structure source |
| 2 | Empty `/` document | §5 `_redirects` |
| 3 | Static title, no OG/canonical | §5 `generateMetadata` |
| 4, 8 | 3.1 MB GIFs, watermark, devtools | §2.10 static screenshots |
| 5 | Contrast failures | §4 tokens |
| 6 | Near-empty detail pages | Phase 3 content |
| 7 | Raw markdown tables | §5 `remark-gfm` |
| 9 | Korean mid-word breaks | §4 typography |

Also: Noto Sans JP `subsets: ["latin"]` bug (moot once ja uses Zen Maru
Gothic, but remove the dead config), ProjectNav arrow direction, README.

## 7. Phases

Work happens on branch `redesign`; Cloudflare Pages preview URLs are used for
review. `main` (auto-deploys to imysh.pages.dev) is merged once, after Phase 3.

1. **Foundation** — data model + validation, remark, locale change, redirects,
   metadata, CI. Existing content (everyai, kigaru, kaouranai) is migrated
   verbatim into the new structure.
2. **Visual** — tokens, "now" section, path table with sub-rows, detail page
   order, typography, a11y.
3. **Content** — Korean drafts from the vault → user review → Japanese
   translation → user review. New pages: my-asset-manager, kigaru/jihanki,
   second-brain, imysh. Photos and screenshots.
4. **Pre-launch check** — real phone, OG previews, Lighthouse; then merge.

Owner split: code by a subagent in this repo; copy, photos, everyai
screenshots and publication-scope calls by the user.

## 8. Open items (decide during Phase 3, not blocking Phases 1–2)

- Slug for the programming vending machine: proposed `jihanki`.
- Which photos exist; rows without a photo drop the cell.
- Public scope: naming the study venue/city, employer names, how to word the
  talking-bar period.
- Two hand-off lines in the draft copy are inferences, not vault quotes:
  2023→2024 「それを探しに外へ出た」 and 2025→2026 「自分の手でつくってみたくなった」.
- My Asset Manager facts marked 추정 in
  `SecondBrain/04-Archive/my-asset-manager/my-asset-manager_index.md`.
