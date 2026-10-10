# imysh

A small personal site that says what kind of person I am: what I think now, the path that led here, and the things I made along the way. It is written for people I meet in Japan, so Japanese is the default and Korean is second.

- 日本語: いまの考えと、そこに至るまでの道、その途中でつくったものをまとめた個人サイトです。
- 한국어: 지금의 생각과 여기까지 온 길, 그 사이에 만든 것들을 담은 개인 사이트입니다.

Live: <https://imysh.pages.dev> (`/ja`, `/ko`)

## Stack

- Next.js 16 (App Router, static export) · React 19 · TypeScript (strict)
- Tailwind CSS 4 with role tokens (`app/globals.css`)
- next-intl (`ja` default, `ko`)
- Markdown via unified + remark-gfm, content validated with zod
- Fonts self-hosted as site-specific subsets (Zen Maru Gothic, Pretendard)
- Cloudflare Pages (`public/_redirects`, `public/_headers`), GitHub Actions CI

## Content model

Structure lives in one place, sentences per locale. A missing locale fails the build.

```
content/now.yaml + now.{ja,ko}.yaml         "01 いま" — the first screen
content/path.yaml + path.{ja,ko}.yaml       "02 ここまで" — one line from 2023 to now
content/projects/<slug>/meta.yaml           period, stack, status, images, sections, links
content/projects/<slug>/{ja,ko}.md          title, summary, role + body
images-src/images.json                      image sources → public/images/*.webp
messages/{ja,ko}.json                       UI strings
```

A project page has fixed sections: why → what (tech folded away) → what I thought. `meta.yaml` `sections` maps each `##` heading of the markdown onto them in order.

## Adding a project

1. Create `content/projects/<slug>/meta.yaml`, `ko.md` and `ja.md` (a sub-project lives in `content/projects/<parent>/<slug>/`).
2. Put screenshots in `images-src/`, list them in `images-src/images.json`, run `npm run images`, and reference `/images/....webp`.
3. Optionally link it from a node in `content/path.yaml`.
4. Run `npm run check:content`. If it reports characters outside the font subset, run `npm run fonts`.
5. Run `npm run build && npm run check:meta`.

The in-repo skill `.claude/skills/portfolio-page-generator/SKILL.md` walks through the same steps.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (open `/ja`; the `/` redirect only exists on Cloudflare) |
| `npm run build` | Renders OG cards (`prebuild`), validates content, static export to `out/` |
| `npm run lint` / `npm run typecheck` | ESLint / `next typegen` + `tsc` |
| `npm run check:content` | Both locales present, references and images exist, no draft markers, glyphs covered |
| `npm run check:meta` | After a build: title, description, canonical, hreflang and OG on every page |
| `npm run images` | Source images → two webp widths + size manifest |
| `npm run fonts` | Re-subsets the fonts to the site's characters |
| `npm run og` | 1200×630 Open Graph card per page into `public/og/` |

Design notes and history: `docs/superpowers/specs/2026-10-10-imysh-redesign-design.md`, `docs/progress.md`.
