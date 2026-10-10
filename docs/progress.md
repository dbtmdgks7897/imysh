# imysh — progress

## Where things stand (2026-10-10)

Portfolio website (personal branding + tech showcase), Next.js 16 App Router
with Static Export, 3 locales (KO/JA/EN). **Live and serving today** at
<https://imysh.pages.dev> via Cloudflare Pages (auto-deploy from
`github.com/dbtmdgks7897/imysh`, branch `main`). Code has not been touched
since 2026-03-09; the deployment has stayed up by itself.

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

If resuming, in this order:

1. **Migrate the remaining past project(s)** — `spec.md` assumed three
   projects; everyai is the only migrated one. Use the in-repo skill
   `.claude/skills/portfolio-page-generator/SKILL.md` (paste a
   `portfolio-*.md`, it writes ko/ja/en + inserts into `PROJECTS` + verifies
   the build).
2. **Fill in kigaru and kaouranai** — screenshots, a real `liveUrl`
   (`kigaru.pages.dev` per spec), and a repo-level `githubUrl`. These two
   pages are the weakest thing a visitor currently sees.
3. **Decide the image hosting story** — either commit thumbnails/screenshots
   under `public/images/projects/` or accept the R2 bucket as a dependency
   and write it down.

Then, from the Phase 2 backlog in `prompt_plan.md`: custom domain, dark
mode, dynamic OG images, analytics.

## Log

- 2026-10-10: Repo scanned for a SecondBrain vault record (intent, state,
  results, stack, resume path, decisions). Verified build + lint pass and
  that imysh.pages.dev is live and current with commit `0f6226a`. Created
  this file; no source changes.
