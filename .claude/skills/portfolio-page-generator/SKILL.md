---
name: portfolio-page-generator
description: Add or update a project page on the imysh site from a pasted portfolio-*.md (output of the notion-to-portfolio skill) or from a Korean draft the user provides. Writes content/projects/<slug>/meta.yaml, ko.md and a ja.md draft, optionally links the project from content/path.yaml, and verifies with check:content and a build. Triggers - "이 md로 상세 페이지 만들어", "포트폴리오 페이지 생성", "portfolio-*.md 적용", "프로젝트 추가", "새 프로젝트 페이지", or a pasted portfolio-*.md.
---

# Portfolio Page Generator

Adds one project to the imysh site. The site is a "who I am" site for people in
Japan: `ja` is the default locale, `ko` the second. There is no `en`.

## Content model (structure in one place, sentences per locale)

```
content/projects/<slug>/meta.yaml      structure: period, stack, status, order, thumbnail, links
content/projects/<slug>/ko.md          frontmatter: title, summary   + Korean body
content/projects/<slug>/ja.md          frontmatter: title, summary   + Japanese body
content/projects/<parent>/<child>/...  sub-project, same three files
content/path.yaml                      path nodes may list the project under `projects:`
```

There is no hand-maintained project list and no card data anywhere else. Hub cards, detail
headers and prev/next links are all derived from these files.

`meta.yaml` schema (`lib/content/schema.ts`, zod, strict — unknown keys fail):

```yaml
period: "2026.03~"                 # required, free text
stack: ["Next.js", "FastAPI"]      # required
status: in-progress                # required: deployed | in-progress | finished | closed | planned | paused
order: 3                           # optional, sorts siblings (lower first)
thumbnail: /images/projects/<slug>/thumbnail.webp   # optional; local file must exist under public/
hero: /images/projects/<slug>/hero.webp             # optional; large image at the top of the detail page
# thumbnail/hero may also be per-locale, every locale required: { ja: /images/....webp, ko: /images/....webp }
sections: [why, what, tech, thought]               # required: one key per "## " in the md, in order
links:                             # optional
  github: https://github.com/<user>/<repo>          # a repo, not the profile root
  live: https://example.pages.dev
```

`ko.md` / `ja.md` frontmatter may contain **only** `title`, `summary` and an optional `role` (立場, only when a source states it).

Images: put the original in `images-src/`, add it to `images-src/images.json`, run `npm run images`, and reference the generated `/images/....webp` path (meta.yaml and markdown alike). Remote image URLs are rejected. Never write draft markers like 【…】 into content — check:content fails on them.

## Steps

1. **Parse the input.** From a portfolio-*.md: slug from the first h1
   (`# <slug> — 프로젝트 포트폴리오`), metadata from the header table, body from the
   first `## N.` section onward. Map status: 운영중/배포됨/deployed/live → `deployed`;
   개발중/진행중/in-progress → `in-progress`; 기획중/예정/planned → `planned`;
   서비스 종료/closed → `closed`; 중지/접어 둠/paused → `paused`.
   A `상위 프로젝트` row makes it a sub-project at `content/projects/<parent>/<slug>/`
   (the parent directory must already exist). Ask if the slug is unclear.
2. **Sections.** Detail pages have fixed sections: `why` (01 なぜ始めたか),
   `what` (02 何をつくったか), `tech` (folded into "技術の話をもっと見る"),
   `thought` (03 ここで考えたこと, ending with where it stopped or why it
   continues). `meta.yaml` `sections` lists one key per `## ` heading in the md,
   in order; ja.md and ko.md must have the same number of `## ` headings, and
   nothing may come before the first one. Several headings may share a key
   (their text is kept as sub-headings). Omit a section rather than inventing it.
3. **Body order.** Detail pages read: why I started → what I made → where it
   stopped / why it continues. Keep the user's sections, in that order where
   they map; do not invent content. Keep tables, code blocks and lists — the site
   renders GFM. Images: commit them under `public/images/projects/<slug>/` and
   reference `/images/projects/<slug>/<file>`; do not add new remote image URLs.
4. **Write `meta.yaml`** with the structural fields above.
5. **Write `ko.md`** — the user's Korean, as given. Do not polish it.
6. **Write `ja.md`** — translate title, summary and body into natural Japanese
   (です・ます調). Do not translate code, proper nouns or tech names. Tell the
   user the ja file is a **draft for their review**; translation is a human gate.
7. **Link it from the path (ask first).** If the project belongs to a node in
   `content/path.yaml`, offer to add `<slug>` (or `<parent>/<slug>`) to that
   node's `projects:` list. Validation fails if a path node references a slug
   that does not exist, so add the reference only after the files exist.
8. **Verify** (all must pass):

   ```bash
   npm run check:content      # if it reports characters outside the font subset: npm run fonts
   npm run typecheck          # next typegen && tsc -p tsconfig.json --noEmit
   npm run lint
   npm run build
   ls out/ja/projects/<slug>.html out/ko/projects/<slug>.html
   ```

   `check:content` reports every problem at once (missing locale file, unknown
   key, bad status, missing image, dangling path reference). Fix and re-run.
   Never use `npx tsc --noEmit <file>`: it ignores tsconfig and reports spurious errors.

## Report

```
Project "<title>" added
Files: content/projects/<slug>/meta.yaml, ko.md, ja.md (draft — please review)
Path: linked from node "<id>" | not linked
Routes: /ja/projects/<slug>, /ko/projects/<slug>
Checks: check:content ✓  typecheck ✓  lint ✓  build ✓
```

## Edge cases

- Slug already exists: show what would change and ask before overwriting.
- Several projects pasted at once: split on the h1 pattern and handle one at a time.
- Order collision: shift the later siblings' `order` by one.
- Build fails: read the error, fix, rebuild; if it is not a content problem, report it.
