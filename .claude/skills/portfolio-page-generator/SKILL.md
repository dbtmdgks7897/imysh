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
status: in-progress                # required: deployed | in-progress | planned
order: 3                           # optional, sorts siblings (lower first)
thumbnail: /images/projects/<slug>/thumbnail.webp   # optional; local file must exist under public/
links:                             # optional
  github: https://github.com/<user>/<repo>          # a repo, not the profile root
  live: https://example.pages.dev
```

`ko.md` / `ja.md` frontmatter may contain **only** `title` and `summary`.

## Steps

1. **Parse the input.** From a portfolio-*.md: slug from the first h1
   (`# <slug> — 프로젝트 포트폴리오`), metadata from the header table, body from the
   first `## N.` section onward. Map status: 운영중/배포됨/deployed/live → `deployed`;
   개발중/진행중/in-progress → `in-progress`; 기획중/예정/planned → `planned`.
   A `상위 프로젝트` row makes it a sub-project at `content/projects/<parent>/<slug>/`
   (the parent directory must already exist). Ask if the slug is unclear.
2. **Body order.** Detail pages read: why I started → what I made → where it
   stopped / why it continues. Keep the user's sections, in that order where
   they map; do not invent content. Keep tables, code blocks and lists — the site
   renders GFM. Images: commit them under `public/images/projects/<slug>/` and
   reference `/images/projects/<slug>/<file>`; do not add new remote image URLs.
3. **Write `meta.yaml`** with the structural fields above.
4. **Write `ko.md`** — the user's Korean, as given. Do not polish it.
5. **Write `ja.md`** — translate title, summary and body into natural Japanese
   (です・ます調). Do not translate code, proper nouns or tech names. Tell the
   user the ja file is a **draft for their review**; translation is a human gate.
6. **Link it from the path (ask first).** If the project belongs to a node in
   `content/path.yaml`, offer to add `<slug>` (or `<parent>/<slug>`) to that
   node's `projects:` list. Validation fails if a path node references a slug
   that does not exist, so add the reference only after the files exist.
7. **Verify** (all must pass):

   ```bash
   npm run check:content
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
