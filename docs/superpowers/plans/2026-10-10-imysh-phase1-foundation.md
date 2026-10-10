# imysh Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-source project data with one validated content model, drop `en` and make `ja` the default, render markdown with remark + GFM, give every page real metadata, and add CI — without changing how the site looks.

**Architecture:** All content lives under `content/`: structure in `*.yaml` (one file per thing), sentences per locale (`*.{ja,ko}.yaml`, `{ja,ko}.md`). A small `lib/content/` module reads it, validates it with zod, and cross-checks it (both locales present, referenced slugs and images exist). The same check runs in three places: `npm run check:content`, at build time from the locale layout's `generateStaticParams`, and in CI. Pages consume typed loaders instead of `PROJECTS` and gray-matter casts.

**Tech Stack:** Next.js 16.1.6 (App Router, `output: "export"`), React 19.2.3, next-intl 4.8.3, TypeScript 5.9 (strict), Tailwind CSS 4, zod 4, yaml 2, unified 11 + remark-parse 11 + remark-gfm 4 + remark-rehype 11 + hast-util-to-jsx-runtime 2, tsx 4 (script runner only), GitHub Actions, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-10-10-imysh-redesign-design.md` (§5 data model, §7 Phase 1). Visual reference for the placeholder copy: artboard **C3 · やわらかい索引** (`project/Index3.dc.html`) in https://claude.ai/artifact/Tr3MugFgFgucQyGEor13pb.

## Global Constraints

- All work happens on branch `redesign`, created from local `main` (which is 1 commit ahead of `origin/main`: the audit commit `52b8859`). `main` auto-deploys to imysh.pages.dev and is not merged into until after Phase 3 (spec §7).
- Commit and push only if the user has authorized it for this run. Every "Commit" step below is written out so it is ready, but skip it (leave changes staged-or-unstaged) when commits are not authorized. Never push to `main`.
- Locales: `ja` (default) and `ko`. `en` is removed. next-intl stays (spec §2.2).
- Structure in one place, sentences per locale (spec §5). No silent fallback to another locale: a missing locale file is a build error.
- Existing content is migrated **verbatim**: ko text stays as is, ja text stays as is, en files are deleted. Only frontmatter keys move; markdown bodies do not change by a single byte.
- Phase 1 must not change visuals beyond what is needed to keep pages rendering. Keep every existing `className`. No new tokens, fonts, sections or layout. The now/path content is validated but **not rendered** (rendering is Phase 2).
- No test runner (spec §2.11). Verification is `npm run check:content`, `npm run lint`, `npm run typecheck`, `npm run build`, and greps against the static output in `out/`.
- Site URL: `https://imysh.pages.dev` (no custom domain yet).
- Code comments in English. Do not edit files outside `/Users/ysh/dev/imysh`.
- `out/` and `.next/` are build artifacts (gitignored). Run `npm run build` before any `out/` grep.

## Where the spec disagrees with the code (verified 2026-10-10)

Read these before starting; they change some steps relative to a literal reading of the spec.

1. **There is no next-intl routing config to change.** No `routing.ts`, no `defineRouting`, no middleware (middleware cannot run under static export anyway). "Default locale" lives in exactly two places: the `?? "ko"` fallback in `lib/i18n.ts:4` and the client-side detector in `app/page.tsx`. The locale list is hard-coded in four places (`app/page.tsx:6`, `app/[locale]/layout.tsx:28`, `app/[locale]/projects/[...slug]/page.tsx:13`, `components/layout/LanguageSwitcher.tsx:5-9`). Task 1 replaces all of them with one `lib/locales.ts`.
2. **`tsc -p tsconfig.json --noEmit` on a fresh CI checkout** has no `.next/types` (tsconfig includes `.next/types/**/*.ts`). The plan runs `next typegen` first (available in Next 16.1.6) via an `npm run typecheck` script.
3. **"Every image referenced exists" cannot be fully enforced in Phase 1.** The everyai thumbnail and all 12 body GIFs are remote R2 URLs (`pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev`); they stay until Phase 3 replaces them with committed screenshots (spec §2.10). Phase 1 validates local `/images/...` paths against `public/` and accepts `https://` URLs. Images inside markdown bodies are not validated.
4. **Spec §3 path rows link to project slugs that do not exist yet** (`my-asset-manager`, `kigaru/jihanki`, `imysh`, `second-brain`). Because validation rejects references to missing slugs, the placeholder `path.yaml` / `now.yaml` link only `everyai` and `kigaru/kaouranai`; the others are left as YAML comments to be filled in Phase 3 when their pages exist.
5. **Spec §3 row 2023 says "My Asset Manager → everyai"; the C3 artboard copy says only everyai.** The placeholder copy follows the artboard (the spec asks for its draft Japanese copy). My Asset Manager joins in Phase 3.
6. **Spec §5 lists per-node text as `doing, thought, next`.** The C3 copy also has a year-cell label (`2026 前半`), a secondary line under some thoughts, and a section heading. The text schema adds `label` (required), `thoughtNote` (optional) and a top-level `heading`. `next` is required on every node except the single `current` node (the last row, which links back to 01 instead).
7. **Spec does not mention the live `/en` URLs.** `/en`, `/en/projects/kigaru` etc. are live and may be indexed. `public/_redirects` also sends `/en` and `/en/*` to the `ja` equivalents with 301.
8. **`app/page.tsx` is deleted, not fixed.** With `_redirects` handling `/`, the client-only redirect page is dead weight and is the "empty `/` document" from audit blocker 2. Side effect: `next dev` shows a 404 at `/`; open `/ja` locally.
9. **Visible text changes that come from removing the drift, not from design work:** hub card and prev/next titles switch from the `PROJECTS` array (`"EveryAI"`, Korean on every locale) to each locale's frontmatter (`"EveryAI - AI 작품·서비스 거래 플랫폼"` / `"EveryAI - AI作品・サービス取引プラットフォーム"`). That is the intended fix for audit blocker 1. Copy is rewritten in Phase 3.
10. **The Noto Sans JP `subsets: ["latin"]` diagnosis (spec §6) is unverified.** `subsets` in `next/font/google` controls preloading; the generated CSS normally still carries the CJK `unicode-range` faces. Not touched here — Phase 2 replaces the font with Zen Maru Gothic anyway; check computed fonts then.
11. **zod is already in `node_modules` (4.3.6) only as a transitive dependency of `eslint-plugin-react-hooks`.** It must be added as a direct dependency.

## File map

Created:

| File | Responsibility |
|---|---|
| `lib/locales.ts` | `LOCALES`, `DEFAULT_LOCALE`, `Locale`, `isLocale`, `assertLocale` |
| `lib/site.ts` | `SITE_URL`, `SITE_NAME` |
| `lib/seo.ts` | `pageMetadata()` — title, description, canonical, absolute hreflang, OG, Twitter |
| `lib/content/paths.ts` | `CONTENT_ROOT`, `PUBLIC_ROOT` |
| `lib/content/read.ts` | `ContentError`, `readYamlFile`, `parseWith`, `rel` |
| `lib/content/schema.ts` | All zod schemas and inferred types |
| `lib/content/projects.ts` | Project loaders (`listProjectSlugPaths`, `loadProject`, …) |
| `lib/content/profile.ts` | now/path loaders |
| `lib/content/validate.ts` | `collectContentErrors`, `assertContentValid` |
| `scripts/check-content.ts` | CLI wrapper: `npm run check:content [dir]` |
| `content/projects/{everyai,kigaru,kigaru/kaouranai}/meta.yaml` | Structural project data |
| `content/now.yaml`, `content/now.{ja,ko}.yaml` | "now" structure + text (placeholder) |
| `content/path.yaml`, `content/path.{ja,ko}.yaml` | path structure + text (placeholder) |
| `public/_redirects` | `/` → `/ja` (302), `/en*` → `/ja*` (301) |
| `.github/workflows/ci.yml` | lint, typecheck, content check, build |

Modified: `package.json`, `package-lock.json`, `lib/i18n.ts`, `app/globals.css`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/projects/[...slug]/page.tsx`, `components/layout/LanguageSwitcher.tsx`, `components/home/ProjectsSection.tsx`, `components/projects/{ProjectCard,ProjectHeader,ProjectNav,SubProjectList,ProjectContent}.tsx`, `components/ui/StatusBadge.tsx`, `messages/{ja,ko}.json`, the six `content/projects/**/{ja,ko}.md` (frontmatter only), `.claude/skills/portfolio-page-generator/SKILL.md`, `CLAUDE.md`.

Deleted: `app/page.tsx`, `messages/en.json`, `content/projects/**/en.md` (3 files), `lib/projects.ts`, `lib/markdown.ts`.

---

### Task 0: Branch

**Files:** none

- [ ] **Step 1: Create the branch from local main**

```bash
cd /Users/ysh/dev/imysh
git switch main
git status --short          # expect only: ?? docs/superpowers/
git switch -c redesign
```

- [ ] **Step 2: Baseline build, and record the two defects this phase fixes**

```bash
npm ci
npm run build
grep -c '| 기능 |' out/ko/projects/kigaru.html          # expect 2  (raw GFM table — audit blocker 7)
grep -o '<link rel="alternate"[^>]*>' out/ko/projects/everyai.html
# expect hrefLang ko/ja/en with RELATIVE hrefs "/ko/" — audit blocker 3
```

- [ ] **Step 3: Commit the spec and this plan** (only if commits are authorized)

```bash
git add docs/superpowers/
git commit -m "docs: add redesign spec and Phase 1 plan"
```

---

### Task 1: Two locales, ja default, redirects

**Files:**
- Create: `lib/locales.ts`, `lib/site.ts`, `public/_redirects`
- Modify: `lib/i18n.ts`, `app/[locale]/layout.tsx`, `app/[locale]/projects/[...slug]/page.tsx:13-20`, `components/layout/LanguageSwitcher.tsx`, `app/globals.css:17`
- Delete: `app/page.tsx`, `messages/en.json`, `content/projects/everyai/en.md`, `content/projects/kigaru/en.md`, `content/projects/kigaru/kaouranai/en.md`

**Interfaces:**
- Produces: `LOCALES: readonly ["ja","ko"]`, `type Locale = "ja" | "ko"`, `DEFAULT_LOCALE: Locale = "ja"`, `isLocale(v: unknown): v is Locale`, `assertLocale(v: string): Locale` (calls `notFound()` on unknown values); `SITE_URL = "https://imysh.pages.dev"`, `SITE_NAME = "imysh"`.

- [ ] **Step 1: Write `lib/locales.ts`**

```ts
import { notFound } from "next/navigation";

// Order matters: the first entry is the default and is listed first in the switcher.
export const LOCALES = ["ja", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ja";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// For route params: unknown locale segments become a 404 instead of a cast.
export function assertLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}
```

- [ ] **Step 2: Write `lib/site.ts`**

```ts
// Absolute origin for canonical, hreflang and OG URLs. Change here when a custom domain is added.
export const SITE_URL = "https://imysh.pages.dev";
export const SITE_NAME = "imysh";
```

- [ ] **Step 3: Replace `lib/i18n.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locales";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Edit `app/[locale]/layout.tsx`** — remove Inter (only `en` used it), use the shared locale list.

Replace lines 1-60 (imports through `const fontClass`) so the top of the file reads:

```tsx
import type { Metadata } from "next";
import { Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { LOCALES, assertLocale, type Locale } from "@/lib/locales";
import "../globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--next-noto-jp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--next-jetbrains-mono",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Replaced by the full metadata in Task 5.
export function generateMetadata(): Metadata {
  return {
    title: "imysh",
    description: "Personal portfolio — Projects, craft, and values.",
  };
}

const localeFontClass: Record<Locale, string> = {
  ja: "font-noto-sans-jp",
  ko: "font-pretendard",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);
  const messages = await getMessages();
  const fontClass = localeFontClass[locale];
```

And in the returned JSX change the body className to drop Inter:

```tsx
      <body className={`${notoSansJP.variable} ${jetbrainsMono.variable}`}>
```

Everything else in the JSX (the Pretendard `<link>`, provider, nav, footer) stays as is.

- [ ] **Step 5: Remove the dead Inter token** — delete this line from `app/globals.css` (line 17):

```css
  --font-inter: var(--next-inter), ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 6: Edit `app/[locale]/projects/[...slug]/page.tsx`** — replace line 13 `const LOCALES = ["ko", "ja", "en"];` with an import (the rest of this file is rewritten in Task 2):

```tsx
import { LOCALES } from "@/lib/locales";
```

(move it up with the other imports).

- [ ] **Step 7: Replace `components/layout/LanguageSwitcher.tsx`** — two locales, no localStorage (the only reader was `app/page.tsx`, deleted below). Markup and classNames unchanged.

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/locales";

const LABELS: Record<(typeof LOCALES)[number], string> = { ja: "JA", ko: "KO" };

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || DEFAULT_LOCALE;

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      {LOCALES.map((code, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-mid-gray select-none">|</span>}
          <button
            onClick={() => switchLocale(code)}
            className={
              code === currentLocale
                ? "text-sage font-semibold"
                : "text-taupe hover:text-charcoal transition-colors"
            }
            aria-pressed={code === currentLocale}
          >
            {LABELS[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
```

Note: the switcher order becomes JA | KO (was KO | JA | EN) because `ja` is now the default.

- [ ] **Step 8: Write `public/_redirects`** (Cloudflare Pages syntax; Next copies `public/` into `out/`)

```
# Root has no page; send visitors to the default locale.
/        /ja           302
# en was removed on 2026-10-10; keep old links working.
/en      /ja           301
/en/*    /ja/:splat    301
```

- [ ] **Step 9: Delete the en files and the client redirect page**

```bash
git rm app/page.tsx messages/en.json \
  content/projects/everyai/en.md content/projects/kigaru/en.md content/projects/kigaru/kaouranai/en.md
```

- [ ] **Step 10: Verify no stale locale references remain**

```bash
grep -rn -E '"en"|font-inter|next-inter|localStorage' app components lib
```
Expected: no output.

- [ ] **Step 11: Build and check the output**

```bash
rm -rf out && npm run build && npm run lint
ls out | grep -E '^(en|index)' ; echo "exit=$?"       # expect no lines, exit=1
cat out/_redirects                                     # expect the 3 rules
grep -o '<html lang="[a-z]*"' out/ja.html              # expect <html lang="ja"
ls out/ja/projects out/ko/projects                     # everyai, kigaru (+ kigaru/kaouranai)
```

Pages must still render exactly as before (only the switcher lost EN and the root redirect page is gone).

- [ ] **Step 12: Commit**

```bash
git add -A lib app components public messages content
git commit -m "feat: drop en, make ja the default locale, redirect / via _redirects"
```

---

### Task 2: One validated project model (meta.yaml + per-locale md)

**Files:**
- Create: `lib/content/paths.ts`, `lib/content/read.ts`, `lib/content/schema.ts`, `lib/content/projects.ts`, `lib/content/validate.ts`, `scripts/check-content.ts`, `content/projects/everyai/meta.yaml`, `content/projects/kigaru/meta.yaml`, `content/projects/kigaru/kaouranai/meta.yaml`
- Modify: `package.json` (deps + scripts), the six `content/projects/**/{ja,ko}.md` (frontmatter only), `app/[locale]/layout.tsx` (`generateStaticParams`), `app/[locale]/page.tsx`, `app/[locale]/projects/[...slug]/page.tsx`, `components/home/ProjectsSection.tsx`, `components/projects/ProjectCard.tsx`, `components/projects/ProjectHeader.tsx`, `components/projects/ProjectNav.tsx`, `components/projects/SubProjectList.tsx`, `components/ui/StatusBadge.tsx`
- Delete: `lib/projects.ts`, `lib/markdown.ts`

**Interfaces:**
- Consumes: `LOCALES`, `Locale`, `assertLocale` from Task 1.
- Produces:
  - `lib/content/schema.ts`: `PROJECT_STATUSES`, `type ProjectStatus = "deployed" | "in-progress" | "planned"`, `projectMetaSchema`, `type ProjectMeta = { period: string; stack: string[]; status: ProjectStatus; order?: number; thumbnail?: string; links: { github?: string; live?: string } }`, `projectFrontmatterSchema` (`{ title, summary }`), `imageRefSchema`, `idSchema`, `slugPathSchema`.
  - `lib/content/projects.ts`: `interface Project { slugPath: string[]; meta: ProjectMeta; title: string; summary: string; body: string }`, `projectHref(locale: Locale, slugPath: string[]): string`, `listProjectSlugPaths(root?: string): string[][]`, `loadProjectMeta(slugPath: string[], root?: string): ProjectMeta`, `loadProjectText(slugPath: string[], locale: Locale, root?: string): { title; summary; body }`, `loadProject(slugPath: string[], locale: Locale, root?: string): Project`, `listTopLevelProjects(locale: Locale, root?: string): Project[]`, `listChildProjects(parent: string[], locale: Locale, root?: string): Project[]`.
  - `lib/content/read.ts`: `class ContentError extends Error`, `rel(file: string): string`, `readYamlFile(file: string): unknown`, `parseWith<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S>`.
  - `lib/content/validate.ts`: `collectContentErrors(root?: string, publicRoot?: string): string[]`, `assertContentValid(): void`.
  - npm scripts `check:content`, `typecheck`.

- [ ] **Step 1: Add dependencies and scripts**

```bash
npm install zod@^4.6.5 yaml@^2.9.1
npm install -D tsx@^4.23.15
```

Then in `package.json` `"scripts"` add (keep the existing four):

```json
    "check:content": "tsx scripts/check-content.ts",
    "typecheck": "next typegen && tsc -p tsconfig.json --noEmit"
```

- [ ] **Step 2: Write `lib/content/paths.ts`**

```ts
import path from "path";

export const CONTENT_ROOT = path.join(process.cwd(), "content");
export const PUBLIC_ROOT = path.join(process.cwd(), "public");
```

- [ ] **Step 3: Write `lib/content/read.ts`**

```ts
import fs from "fs";
import path from "path";
import { parse } from "yaml";
import { z } from "zod";

export class ContentError extends Error {
  name = "ContentError";
}

// Paths in error messages are repo-relative so they are clickable in CI logs.
export function rel(file: string): string {
  return path.relative(process.cwd(), file) || file;
}

export function readYamlFile(file: string): unknown {
  if (!fs.existsSync(file)) throw new ContentError(`missing file: ${rel(file)}`);
  return parse(fs.readFileSync(file, "utf8"));
}

export function parseWith<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentError(`${rel(file)}\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
```

- [ ] **Step 4: Write `lib/content/schema.ts`** (project part; Task 3 appends the now/path schemas)

```ts
import { z } from "zod";

// Closed enum: a typo in meta.yaml fails the build instead of shipping an unstyled badge.
export const PROJECT_STATUSES = ["deployed", "in-progress", "planned"] as const;
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// Local images live under public/images/; remote https URLs are tolerated until Phase 3 removes R2.
export const imageRefSchema = z
  .string()
  .refine((s) => s.startsWith("/images/") || s.startsWith("https://"), {
    message: 'image must start with "/images/" or "https://"',
  });

export const idSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id must be kebab-case");
export const slugPathSchema = z
  .string()
  .regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'project reference must look like "kigaru/kaouranai"');

export const projectMetaSchema = z.strictObject({
  period: z.string().min(1),
  stack: z.array(z.string().min(1)),
  status: projectStatusSchema,
  order: z.number().int().optional(),
  thumbnail: imageRefSchema.optional(),
  links: z
    .strictObject({
      github: z.url().optional(),
      live: z.url().optional(),
    })
    .default({}),
});
export type ProjectMeta = z.infer<typeof projectMetaSchema>;

// Per-locale frontmatter carries sentences only; everything structural is in meta.yaml.
export const projectFrontmatterSchema = z.strictObject({
  title: z.string().min(1),
  summary: z.string().min(1),
});
```

- [ ] **Step 5: Write `lib/content/projects.ts`**

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/lib/locales";
import { CONTENT_ROOT } from "./paths";
import { ContentError, parseWith, readYamlFile, rel } from "./read";
import { projectFrontmatterSchema, projectMetaSchema, type ProjectMeta } from "./schema";

export interface Project {
  slugPath: string[];
  meta: ProjectMeta;
  title: string;
  summary: string;
  body: string;
}

const projectsDir = (root: string) => path.join(root, "projects");

export function projectHref(locale: Locale, slugPath: string[]): string {
  return `/${locale}/projects/${slugPath.join("/")}`;
}

// A project is any directory under content/projects that has a meta.yaml or a .md file.
// Including md-only directories makes a forgotten meta.yaml a validation error, not a silent skip.
export function listProjectSlugPaths(root: string = CONTENT_ROOT): string[][] {
  const found: string[][] = [];
  const walk = (dir: string, prefix: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const slugPath = [...prefix, entry.name];
      const full = path.join(dir, entry.name);
      const files = fs.readdirSync(full);
      if (files.includes("meta.yaml") || files.some((f) => f.endsWith(".md"))) {
        found.push(slugPath);
      }
      walk(full, slugPath);
    }
  };
  if (fs.existsSync(projectsDir(root))) walk(projectsDir(root), []);
  return found;
}

export function loadProjectMeta(slugPath: string[], root: string = CONTENT_ROOT): ProjectMeta {
  const file = path.join(projectsDir(root), ...slugPath, "meta.yaml");
  return parseWith(projectMetaSchema, readYamlFile(file), file);
}

// Sentences only; validation calls this separately so a bad meta.yaml does not hide md errors.
export function loadProjectText(
  slugPath: string[],
  locale: Locale,
  root: string = CONTENT_ROOT,
): Pick<Project, "title" | "summary" | "body"> {
  const file = path.join(projectsDir(root), ...slugPath, `${locale}.md`);
  // No fallback to another locale: a missing translation is an error.
  if (!fs.existsSync(file)) throw new ContentError(`missing file: ${rel(file)}`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const frontmatter = parseWith(projectFrontmatterSchema, data, file);
  return { title: frontmatter.title, summary: frontmatter.summary, body: content };
}

export function loadProject(slugPath: string[], locale: Locale, root: string = CONTENT_ROOT): Project {
  return { slugPath, meta: loadProjectMeta(slugPath, root), ...loadProjectText(slugPath, locale, root) };
}

const byOrder = (a: Project, b: Project) => (a.meta.order ?? 99) - (b.meta.order ?? 99);

export function listTopLevelProjects(locale: Locale, root: string = CONTENT_ROOT): Project[] {
  return listProjectSlugPaths(root)
    .filter((s) => s.length === 1)
    .map((s) => loadProject(s, locale, root))
    .sort(byOrder);
}

export function listChildProjects(parent: string[], locale: Locale, root: string = CONTENT_ROOT): Project[] {
  return listProjectSlugPaths(root)
    .filter((s) => s.length === parent.length + 1 && parent.every((p, i) => s[i] === p))
    .map((s) => loadProject(s, locale, root))
    .sort(byOrder);
}
```

- [ ] **Step 6: Write `lib/content/validate.ts`** (project checks; Task 3 replaces the file with a version that adds now/path)

```ts
import fs from "fs";
import path from "path";
import { LOCALES } from "@/lib/locales";
import { CONTENT_ROOT, PUBLIC_ROOT } from "./paths";
import { ContentError } from "./read";
import { listProjectSlugPaths, loadProjectMeta, loadProjectText } from "./projects";

const ALLOWED_MD = new Set(LOCALES.map((l) => `${l}.md`));

function attempt(errors: string[], fn: () => void) {
  try {
    fn();
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }
}

function checkImage(errors: string[], ref: string | null | undefined, where: string, publicRoot: string) {
  if (!ref || !ref.startsWith("/")) return; // remote URLs are not checked (see plan note 3)
  if (!fs.existsSync(path.join(publicRoot, ref))) {
    errors.push(`${where}: image not found in public/: ${ref}`);
  }
}

export function collectContentErrors(root: string = CONTENT_ROOT, publicRoot: string = PUBLIC_ROOT): string[] {
  const errors: string[] = [];

  for (const slugPath of listProjectSlugPaths(root)) {
    const slug = slugPath.join("/");
    attempt(errors, () => {
      const meta = loadProjectMeta(slugPath, root);
      checkImage(errors, meta.thumbnail, `projects/${slug}/meta.yaml thumbnail`, publicRoot);
    });
    for (const locale of LOCALES) {
      attempt(errors, () => void loadProjectText(slugPath, locale, root));
    }
    const dir = path.join(root, "projects", ...slugPath);
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".md") && !ALLOWED_MD.has(file)) {
        errors.push(`projects/${slug}/${file}: unexpected locale file (allowed: ${[...ALLOWED_MD].join(", ")})`);
      }
    }
  }

  return errors;
}

let validated = false;

// Called once per build process from the locale layout's generateStaticParams.
export function assertContentValid(): void {
  if (validated) return;
  const errors = collectContentErrors();
  if (errors.length > 0) {
    throw new ContentError(`content check failed (${errors.length}):\n\n${errors.join("\n\n")}`);
  }
  validated = true;
}
```

- [ ] **Step 7: Write `scripts/check-content.ts`**

```ts
// Usage: npm run check:content [content-dir]
// Without an argument it checks ./content. Pass a copied directory to try a broken variant.
import path from "path";
import { collectContentErrors } from "../lib/content/validate";

const root = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
const errors = collectContentErrors(root);

if (errors.length > 0) {
  console.error(`content check failed (${errors.length}):\n\n${errors.join("\n\n")}`);
  process.exit(1);
}
console.log("content check passed");
```

- [ ] **Step 8: Run the check — it must fail** (no `meta.yaml` yet, frontmatter still has structural keys)

Run: `npm run check:content`
Expected: exit 1. Errors include `missing file: content/projects/everyai/meta.yaml` (and kigaru, kigaru/kaouranai), and `Unrecognized keys: "stack", "status", "period", "order"` for each md file.

- [ ] **Step 9: Write the three `meta.yaml` files** (values copied from the current frontmatter; everyai's thumbnail comes from `lib/projects.ts:34`, which is the only place it existed)

`content/projects/everyai/meta.yaml`:

```yaml
period: "2023.10 – 2023.12"
stack: ["Java 17", "Spring Boot 3.1", "JPA", "Spring Security", "Next.js", "JWT", "BootPay"]
status: deployed
order: 2
# Remote until Phase 3 replaces R2 with committed images (spec §2.10).
thumbnail: "https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/logo.jpg"
```

`content/projects/kigaru/meta.yaml`:

```yaml
period: "2026.03~"
stack: ["Next.js", "FastAPI", "React", "Tailwind CSS", "Gemini Flash"]
status: in-progress
order: 1
links:
  # Points at the GitHub profile root, not a repo — carried over verbatim; fix in Phase 3.
  github: "https://github.com/dbtmdgks7897"
```

`content/projects/kigaru/kaouranai/meta.yaml`:

```yaml
period: "2026.03~"
stack: ["React", "Gemini Flash", "Tailwind CSS"]
status: in-progress
order: 1
```

- [ ] **Step 10: Strip structural keys from the six md frontmatters** (keeps `title` and `summary` lines byte-for-byte; bodies untouched)

```bash
cd /Users/ysh/dev/imysh
for f in content/projects/everyai/{ja,ko}.md content/projects/kigaru/{ja,ko}.md content/projects/kigaru/kaouranai/{ja,ko}.md; do
  awk 'NR==1 { print; fm=1; next }
       fm && /^---$/ { fm=0; print; next }
       fm { if ($0 ~ /^(title|summary):/) print; next }
       { print }' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
```

- [ ] **Step 11: Prove the migration is verbatim** — the md diff must contain deletions only.

```bash
git diff -U0 -- content/projects | grep -E '^\+[^+]' ; echo "added-lines-exit=$?"
```
Expected: no lines printed, `added-lines-exit=1`.

```bash
git diff -U0 -- content/projects | grep -E '^-[^-]' | sed -E 's/^-([a-zA-Z]+):.*/\1/' | sort | uniq -c
```
Expected: only `githubUrl` (2), `order` (6), `period` (6), `stack` (6), `status` (6).

- [ ] **Step 12: Run the check — it must pass**

Run: `npm run check:content`
Expected: `content check passed`, exit 0.

- [ ] **Step 13: Prove the check catches each class of mistake** (scratch copies; nothing committed)

```bash
T=$(mktemp -d) && cp -r content "$T/c"
sed -i '' 's/^status: deployed/status: live/' "$T/c/projects/everyai/meta.yaml"
rm "$T/c/projects/kigaru/kaouranai/ja.md"
printf -- '---\ntitle: x\nsummary: y\n---\n' > "$T/c/projects/kigaru/en.md"
npm run check:content -- "$T/c"; echo "exit=$?"
rm -rf "$T"
```
Expected: `exit=1` and three errors — invalid `status` in `everyai/meta.yaml`, `missing file: …/kigaru/kaouranai/ja.md`, `kigaru/en.md: unexpected locale file`.

- [ ] **Step 14: Replace `components/ui/StatusBadge.tsx` line 2**

```tsx
import type { ProjectStatus } from "@/lib/content/schema";
```

- [ ] **Step 15: Replace `components/projects/ProjectCard.tsx`** (same markup/classNames; data now comes from `Project`)

```tsx
import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/locales";
import { projectHref, type Project } from "@/lib/content/projects";
import TechTag from "@/components/ui/TechTag";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
}

export default function ProjectCard({ project, locale }: ProjectCardProps) {
  const { title, summary, meta } = project;
  return (
    <Link
      href={projectHref(locale, project.slugPath)}
      className="group block rounded-lg border border-lavender bg-snow overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-video bg-light-lavender overflow-hidden">
        {meta.thumbnail ? (
          <Image src={meta.thumbnail} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-lavender select-none" aria-label={title}>
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-charcoal">{title}</h3>
          <p className="text-sm text-dark-gray mt-1">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {meta.stack.map((tech) => (
            <TechTag key={tech} label={tech} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={meta.status} />
          <span className="text-xs text-mid-gray">{meta.period}</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 16: Replace `components/home/ProjectsSection.tsx`**

```tsx
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { Project } from "@/lib/content/projects";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectsSectionProps {
  locale: Locale;
  projects: Project[];
}

export default function ProjectsSection({ locale, projects }: ProjectsSectionProps) {
  const t = useTranslations("home");
  return (
    <section className="py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-charcoal pb-4 border-b border-lavender mb-8">
        {t("projectsHeading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.slugPath.join("/")} project={project} locale={locale} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 17: Replace `components/projects/SubProjectList.tsx`** (the conversion hack and `overrideHref` go away)

```tsx
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { Project } from "@/lib/content/projects";
import ProjectCard from "@/components/projects/ProjectCard";

interface SubProjectListProps {
  projects: Project[];
  locale: Locale;
}

export default function SubProjectList({ projects, locale }: SubProjectListProps) {
  const t = useTranslations("subProjectList");
  if (projects.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-charcoal pb-4 border-b border-lavender mb-8">
        {t("heading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.slugPath.join("/")} project={project} locale={locale} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 18: Replace `components/projects/ProjectHeader.tsx`** (same markup; `liveUrl`/`githubUrl` → `meta.links.live`/`meta.links.github`)

```tsx
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import { projectHref, type Project } from "@/lib/content/projects";
import TechTag from "@/components/ui/TechTag";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectHeaderProps {
  project: Project;
  locale: Locale;
  parentTitle?: string;
}

export default function ProjectHeader({ project, locale, parentTitle }: ProjectHeaderProps) {
  const t = useTranslations("projectHeader");
  const { slugPath, meta } = project;
  const parentSlug = slugPath.slice(0, -1);
  const { live, github } = meta.links;

  return (
    <header className="pb-6 border-b border-lavender">
      {parentSlug.length > 0 && (
        <div className="mb-4">
          <Link
            href={projectHref(locale, parentSlug)}
            className="text-sm text-taupe hover:text-sage transition-colors flex items-center gap-1"
          >
            ← {parentTitle ?? parentSlug[parentSlug.length - 1]}
          </Link>
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-charcoal">{project.title}</h1>
      <p className="mt-2 text-lg text-taupe">{project.summary}</p>
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={meta.status} />
          <span className="text-sm text-mid-gray">{meta.period}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {meta.stack.map((tech) => (
            <TechTag key={tech} label={tech} />
          ))}
        </div>
      </div>
      {(live || github) && (
        <div className="mt-4 flex items-center gap-3">
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-dark-sage transition-colors"
            >
              <ExternalLink size={14} />
              {t("live")}
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-taupe hover:text-charcoal transition-colors"
            >
              <Github size={14} />
              {t("github")}
            </a>
          )}
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 19: Replace `components/projects/ProjectNav.tsx`** (prev/next are computed by the page; arrow direction is a Phase 2 fix, kept as is)

```tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import { projectHref } from "@/lib/content/projects";

export interface NavLink {
  href: string;
  title: string;
}

interface ProjectNavProps {
  slugPath: string[];
  locale: Locale;
  prev: NavLink | null;
  next: NavLink | null;
}

export default function ProjectNav({ slugPath, locale, prev, next }: ProjectNavProps) {
  const t = useTranslations("projectNav");

  if (slugPath.length > 1) {
    return (
      <nav className="mt-16 pt-8 border-t border-lavender flex">
        <Link
          href={projectHref(locale, slugPath.slice(0, -1))}
          className="text-sm text-taupe hover:text-sage transition-colors"
        >
          {t("parentProject")}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="mt-16 pt-8 border-t border-lavender flex items-center justify-between">
      <Link href={`/${locale}/`} className="text-sm text-taupe hover:text-sage transition-colors">
        {t("allProjects")}
      </Link>
      <div className="flex gap-6">
        {prev && (
          <Link href={prev.href} className="text-sm text-taupe hover:text-sage transition-colors">
            ← {prev.title}
          </Link>
        )}
        {next && (
          <Link href={next.href} className="text-sm text-taupe hover:text-sage transition-colors">
            {next.title} →
          </Link>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 20: Replace `app/[locale]/page.tsx`**

```tsx
import { setRequestLocale } from "next-intl/server";
import HeroSection from "@/components/home/HeroSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import { assertLocale } from "@/lib/locales";
import { listTopLevelProjects } from "@/lib/content/projects";

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);
  const projects = listTopLevelProjects(locale);
  return (
    <div className="mx-auto max-w-[960px] px-6">
      <HeroSection />
      <ProjectsSection locale={locale} projects={projects} />
    </div>
  );
}
```

- [ ] **Step 21: Replace `app/[locale]/projects/[...slug]/page.tsx`** (`ProjectContent` is still the MDX one until Task 4)

```tsx
import { setRequestLocale } from "next-intl/server";
import { LOCALES, assertLocale } from "@/lib/locales";
import {
  listChildProjects,
  listProjectSlugPaths,
  listTopLevelProjects,
  loadProject,
  projectHref,
  type Project,
} from "@/lib/content/projects";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectContent from "@/components/projects/ProjectContent";
import SubProjectList from "@/components/projects/SubProjectList";
import ProjectNav, { type NavLink } from "@/components/projects/ProjectNav";

export function generateStaticParams() {
  const slugs = listProjectSlugPaths();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);

  const project = loadProject(slug, locale);
  const children = listChildProjects(slug, locale);
  const parent = slug.length > 1 ? loadProject(slug.slice(0, -1), locale) : null;

  // Prev/next only between top-level projects, in meta.yaml `order`.
  const siblings = slug.length === 1 ? listTopLevelProjects(locale) : [];
  const index = siblings.findIndex((p) => p.slugPath[0] === slug[0]);
  const toLink = (p: Project | undefined): NavLink | null =>
    p ? { href: projectHref(locale, p.slugPath), title: p.title } : null;

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <ProjectHeader project={project} locale={locale} parentTitle={parent?.title} />
      <div className="mt-8">
        <ProjectContent source={project.body} />
      </div>
      {children.length > 0 && <SubProjectList projects={children} locale={locale} />}
      <ProjectNav
        slugPath={slug}
        locale={locale}
        prev={index > 0 ? toLink(siblings[index - 1]) : null}
        next={index >= 0 ? toLink(siblings[index + 1]) : null}
      />
    </div>
  );
}
```

- [ ] **Step 22: Run validation at build time** — in `app/[locale]/layout.tsx` add the import and call it from `generateStaticParams`:

```tsx
import { assertContentValid } from "@/lib/content/validate";
```

```tsx
export function generateStaticParams() {
  // Fails the static build on any content error (both locales, slugs, images, enums).
  assertContentValid();
  return LOCALES.map((locale) => ({ locale }));
}
```

- [ ] **Step 23: Delete the old sources and confirm nothing imports them**

```bash
git rm lib/projects.ts lib/markdown.ts
grep -rn -E 'lib/projects|lib/markdown|PROJECTS|ProjectFrontmatter' app components lib scripts
```
Expected: no output.

- [ ] **Step 24: Verify**

```bash
npm run check:content && npm run lint && npm run typecheck && rm -rf out && npm run build
grep -c 'AIベースの運勢・観相サービスプラットフォーム' out/ja.html   # ≥1: ja card summary is Japanese now (audit blocker 1)
grep -c 'AI 기반 운세·관상 서비스 플랫폼' out/ja.html               # 0
grep -c 'AI 기반 운세·관상 서비스 플랫폼' out/ko.html               # ≥1
grep -c 'r2.dev/everyai/logo.jpg' out/ja.html                     # ≥1: thumbnail still on the card
ls out/ja/projects/kigaru/                                         # kaouranai.html present
```

Then prove the build itself rejects bad content:

```bash
sed -i '' 's/^status: in-progress/status: wip/' content/projects/kigaru/meta.yaml
npm run build; echo "exit=$?"            # expect non-zero, message contains "content check failed"
git checkout -- content/projects/kigaru/meta.yaml
```

Open `npm run dev` → `/ja`, `/ko`, `/ja/projects/everyai`, `/ko/projects/kigaru/kaouranai` and compare against imysh.pages.dev: identical layout; only card/nav titles now come from each locale (plan note 9).

- [ ] **Step 25: Commit**

```bash
git add -A package.json package-lock.json lib scripts content app components
git commit -m "feat: single validated project model (meta.yaml + per-locale md)"
```

---

### Task 3: now / path content (placeholder, validated, not rendered)

**Files:**
- Create: `lib/content/profile.ts`, `content/now.yaml`, `content/now.ja.yaml`, `content/now.ko.yaml`, `content/path.yaml`, `content/path.ja.yaml`, `content/path.ko.yaml`
- Modify: `lib/content/schema.ts` (append), `lib/content/validate.ts` (full replacement below)

**Interfaces:**
- Consumes: `idSchema`, `slugPathSchema`, `imageRefSchema`, `readYamlFile`, `parseWith`, `listProjectSlugPaths` (Task 2).
- Produces (Phase 2 renders these):
  - `type Now = { asOf: string; portrait: string | null; cards: { id: string; image: string | null; project: string | null; href: string | null }[]; oneLiners: { id: string; since: string }[] }`
  - `type NowText = { statement: { before: string; accent: string; after: string }; thinking: string[]; cards: Record<string, { label: string; title: string; text: string }>; oneLiners: Record<string, string> }`
  - `type PathData = { nodes: PathNode[] }`, `type PathNode = { id: string; period: string; current: boolean; photos: string[]; projects: string[]; children: PathChild[] }`, `type PathChild = { id: string; photos: string[]; projects: string[] }`
  - `type PathText = { heading: string; nodes: Record<string, { label: string; doing: string; thought: string; thoughtNote?: string; next?: string }> }`
  - `loadNow(root?)`, `loadNowText(locale, root?)`, `loadPath(root?)`, `loadPathText(locale, root?)` in `lib/content/profile.ts`.

- [ ] **Step 1: Append to `lib/content/schema.ts`**

```ts
// ---- now (spec §3.1, §5) ----

export const nowSchema = z.strictObject({
  asOf: z.string().min(1),
  portrait: imageRefSchema.nullable(),
  cards: z.array(
    z.strictObject({
      id: idSchema,
      image: imageRefSchema.nullable(),
      project: slugPathSchema.nullable(), // internal project page, if any
      href: z.url().nullable(), // external link, if any
    }),
  ),
  oneLiners: z.array(z.strictObject({ id: idSchema, since: z.string().min(1) })),
});
export type Now = z.infer<typeof nowSchema>;

export const nowTextSchema = z.strictObject({
  statement: z.strictObject({
    before: z.string().min(1),
    accent: z.string().min(1), // the one accented phrase
    after: z.string().min(1),
  }),
  thinking: z.array(z.string().min(1)).min(1).max(2),
  cards: z.record(
    z.string(),
    z.strictObject({ label: z.string().min(1), title: z.string().min(1), text: z.string().min(1) }),
  ),
  oneLiners: z.record(z.string(), z.string().min(1)),
});
export type NowText = z.infer<typeof nowTextSchema>;

// ---- path (spec §3.2, §5) ----

const pathChildSchema = z.strictObject({
  id: idSchema,
  photos: z.array(imageRefSchema).default([]),
  projects: z.array(slugPathSchema).default([]),
});
export type PathChild = z.infer<typeof pathChildSchema>;

const pathNodeSchema = z.strictObject({
  id: idSchema,
  period: z.string().min(1),
  current: z.boolean().default(false), // the row that links back to "now"
  photos: z.array(imageRefSchema).default([]),
  projects: z.array(slugPathSchema).default([]),
  children: z.array(pathChildSchema).default([]),
});
export type PathNode = z.infer<typeof pathNodeSchema>;

export const pathSchema = z.strictObject({ nodes: z.array(pathNodeSchema).min(1) });
export type PathData = z.infer<typeof pathSchema>;

export const pathTextSchema = z.strictObject({
  heading: z.string().min(1),
  nodes: z.record(
    z.string(),
    z.strictObject({
      label: z.string().min(1), // year cell, e.g. "2026 前半"
      doing: z.string().min(1),
      thought: z.string().min(1),
      thoughtNote: z.string().min(1).optional(),
      next: z.string().min(1).optional(), // "why I moved on"; required except on the current node
    }),
  ),
});
export type PathText = z.infer<typeof pathTextSchema>;
```

- [ ] **Step 2: Write `lib/content/profile.ts`**

```ts
import path from "path";
import type { Locale } from "@/lib/locales";
import { CONTENT_ROOT } from "./paths";
import { parseWith, readYamlFile } from "./read";
import { nowSchema, nowTextSchema, pathSchema, pathTextSchema, type Now, type NowText, type PathData, type PathText } from "./schema";

export function loadNow(root: string = CONTENT_ROOT): Now {
  const file = path.join(root, "now.yaml");
  return parseWith(nowSchema, readYamlFile(file), file);
}

export function loadNowText(locale: Locale, root: string = CONTENT_ROOT): NowText {
  const file = path.join(root, `now.${locale}.yaml`);
  return parseWith(nowTextSchema, readYamlFile(file), file);
}

export function loadPath(root: string = CONTENT_ROOT): PathData {
  const file = path.join(root, "path.yaml");
  return parseWith(pathSchema, readYamlFile(file), file);
}

export function loadPathText(locale: Locale, root: string = CONTENT_ROOT): PathText {
  const file = path.join(root, `path.${locale}.yaml`);
  return parseWith(pathTextSchema, readYamlFile(file), file);
}
```

- [ ] **Step 3: Replace `lib/content/validate.ts`** with the version that also covers now/path

```ts
import fs from "fs";
import path from "path";
import { LOCALES } from "@/lib/locales";
import { CONTENT_ROOT, PUBLIC_ROOT } from "./paths";
import { ContentError } from "./read";
import { listProjectSlugPaths, loadProjectMeta, loadProjectText } from "./projects";
import { loadNow, loadNowText, loadPath, loadPathText } from "./profile";

const ALLOWED_MD = new Set(LOCALES.map((l) => `${l}.md`));

function attempt(errors: string[], fn: () => void) {
  try {
    fn();
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }
}

function checkImage(errors: string[], ref: string | null | undefined, where: string, publicRoot: string) {
  if (!ref || !ref.startsWith("/")) return; // remote URLs are not checked (see plan note 3)
  if (!fs.existsSync(path.join(publicRoot, ref))) {
    errors.push(`${where}: image not found in public/: ${ref}`);
  }
}

// Every structural id needs text in this locale file, and the file may not carry unknown ids.
function compareIds(errors: string[], where: string, expected: string[], actual: string[]) {
  const have = new Set(actual);
  const want = new Set(expected);
  for (const id of expected) if (!have.has(id)) errors.push(`${where}: missing text for id "${id}"`);
  for (const id of actual) if (!want.has(id)) errors.push(`${where}: text for unknown id "${id}"`);
}

function checkProjectRefs(errors: string[], where: string, refs: (string | null)[], known: Set<string>) {
  for (const ref of refs) {
    if (ref && !known.has(ref)) errors.push(`${where}: unknown project "${ref}"`);
  }
}

function checkUnique(errors: string[], where: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${where}: duplicate id "${id}"`);
    seen.add(id);
  }
}

export function collectContentErrors(root: string = CONTENT_ROOT, publicRoot: string = PUBLIC_ROOT): string[] {
  const errors: string[] = [];
  const slugPaths = listProjectSlugPaths(root);
  const knownProjects = new Set(slugPaths.map((s) => s.join("/")));

  // ---- projects ----
  for (const slugPath of slugPaths) {
    const slug = slugPath.join("/");
    attempt(errors, () => {
      const meta = loadProjectMeta(slugPath, root);
      checkImage(errors, meta.thumbnail, `projects/${slug}/meta.yaml thumbnail`, publicRoot);
    });
    for (const locale of LOCALES) {
      attempt(errors, () => void loadProjectText(slugPath, locale, root));
    }
    const dir = path.join(root, "projects", ...slugPath);
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".md") && !ALLOWED_MD.has(file)) {
        errors.push(`projects/${slug}/${file}: unexpected locale file (allowed: ${[...ALLOWED_MD].join(", ")})`);
      }
    }
  }

  // ---- now ----
  attempt(errors, () => {
    const now = loadNow(root);
    const cardIds = now.cards.map((c) => c.id);
    const lineIds = now.oneLiners.map((o) => o.id);
    checkUnique(errors, "now.yaml cards", cardIds);
    checkUnique(errors, "now.yaml oneLiners", lineIds);
    checkImage(errors, now.portrait, "now.yaml portrait", publicRoot);
    now.cards.forEach((c) => checkImage(errors, c.image, `now.yaml card "${c.id}"`, publicRoot));
    checkProjectRefs(errors, "now.yaml cards", now.cards.map((c) => c.project), knownProjects);
    for (const locale of LOCALES) {
      attempt(errors, () => {
        const text = loadNowText(locale, root);
        compareIds(errors, `now.${locale}.yaml cards`, cardIds, Object.keys(text.cards));
        compareIds(errors, `now.${locale}.yaml oneLiners`, lineIds, Object.keys(text.oneLiners));
      });
    }
  });

  // ---- path ----
  attempt(errors, () => {
    const data = loadPath(root);
    const all = data.nodes.flatMap((n) => [n, ...n.children]);
    const ids = all.map((n) => n.id);
    checkUnique(errors, "path.yaml", ids);
    all.forEach((n) => n.photos.forEach((p) => checkImage(errors, p, `path.yaml "${n.id}" photos`, publicRoot)));
    checkProjectRefs(errors, "path.yaml projects", all.flatMap((n) => n.projects), knownProjects);

    const current = data.nodes.filter((n) => n.current);
    if (current.length !== 1) {
      errors.push(`path.yaml: exactly one node must have current: true (found ${current.length})`);
    } else if (data.nodes[data.nodes.length - 1] !== current[0]) {
      errors.push(`path.yaml: the current node "${current[0].id}" must be the last node`);
    }
    const currentId = current[0]?.id;

    for (const locale of LOCALES) {
      attempt(errors, () => {
        const text = loadPathText(locale, root);
        compareIds(errors, `path.${locale}.yaml nodes`, ids, Object.keys(text.nodes));
        for (const id of ids) {
          const t = text.nodes[id];
          if (t && id !== currentId && !t.next) {
            errors.push(`path.${locale}.yaml "${id}": "next" (why I moved on) is required`);
          }
        }
      });
    }
  });

  return errors;
}

let validated = false;

// Called once per build process from the locale layout's generateStaticParams.
export function assertContentValid(): void {
  if (validated) return;
  const errors = collectContentErrors();
  if (errors.length > 0) {
    throw new ContentError(`content check failed (${errors.length}):\n\n${errors.join("\n\n")}`);
  }
  validated = true;
}
```

- [ ] **Step 4: Run the check — it must fail** (files do not exist yet)

Run: `npm run check:content`
Expected: exit 1 with `missing file: content/now.yaml` and `missing file: content/path.yaml`.

- [ ] **Step 5: Write `content/now.yaml`**

```yaml
# Structure of the "01 いま" section (spec §3.1). Sentences live in now.{ja,ko}.yaml.
# PLACEHOLDER (Phase 1): images and links are filled in Phase 3.
asOf: "2026.10"
portrait: null              # e.g. /images/now/portrait.jpg
cards:
  - id: second-brain
    image: null
    project: null           # set to "second-brain" once content/projects/second-brain exists (Phase 3)
    href: null
  - id: youtube
    image: null
    project: null
    href: null              # channel URL once EP01 is public
oneLiners:
  - id: study-group
    since: "2026.07"
  - id: construction
    since: "2026.08"
```

- [ ] **Step 6: Write `content/now.ja.yaml`** (draft copy from the C3 artboard)

```yaml
# DRAFT (Phase 1 placeholder) — copy taken from the C3 artboard; final copy in Phase 3.
statement:
  before: "誰もが、自分が本当に望む価値のために"
  accent: "生きられるように。"
  after: "それを手伝いたい。"
thinking:
  - "そのためにまず、自分が何を大切にしているのかを確かめているところです。答えはコードより、人との会話の中にあると思っています。"
cards:
  second-brain:
    label: "PROJECT"
    title: "Second Brain"
    text: "自分の考えと選択を記録して、大切にしている価値を見つけるための仕組み。"
  youtube:
    label: "YOUTUBE"
    title: "面白そうだから"
    text: "「面白そう」で選んできた仕事と、そこで考えたこと。EP01 準備中。"
oneLiners:
  study-group: "日本語スタディのリーダー"
  construction: "工事現場で働いています"
```

- [ ] **Step 7: Write `content/now.ko.yaml`**

```yaml
# DRAFT — direct Korean rendering of now.ja.yaml (Phase 1 placeholder).
# Not reviewed by the author; Phase 3 replaces it with Korean written from the vault.
statement:
  before: "누구나 자신이 정말 바라는 가치를 위해"
  accent: "살 수 있도록."
  after: "그걸 돕고 싶다."
thinking:
  - "그러기 위해 먼저, 내가 무엇을 소중히 여기는지 확인하고 있는 중이다. 답은 코드보다 사람과의 대화 속에 있다고 생각한다."
cards:
  second-brain:
    label: "PROJECT"
    title: "Second Brain"
    text: "내 생각과 선택을 기록해서, 소중히 여기는 가치를 찾기 위한 장치."
  youtube:
    label: "YOUTUBE"
    title: "面白そうだから"   # channel name, kept in Japanese
    text: "'재밌어 보여서' 골라 온 일들과, 거기서 생각한 것. EP01 준비 중."
oneLiners:
  study-group: "일본어 스터디 리더"
  construction: "공사 현장에서 일하고 있다"
```

- [ ] **Step 8: Write `content/path.yaml`**

```yaml
# Structure of the "02 ここまで" path (spec §3.2). One line, oldest first; the last node is "now".
# Sentences live in path.{ja,ko}.yaml. Ids are quoted so YAML keeps them as strings.
# PLACEHOLDER (Phase 1): photos and most project links are filled in Phase 3.
nodes:
  - id: "2023"
    period: "2023.07–2023.12"
    projects: [everyai]       # add my-asset-manager when its page exists (Phase 3)
  - id: "2024"
    period: "2024.01–2024.12"
  - id: "2025"
    period: "2025.01–2026.05"
  - id: "2026-h1"
    period: "2026"            # spec gives only "2026 H1"; exact months open (Phase 3)
    children:
      - id: "2026-a"
        projects: [kigaru/kaouranai]
      - id: "2026-b"
        projects: []          # kigaru/jihanki (slug open, spec §8)
      - id: "2026-c"
        projects: []          # imysh
      - id: "2026-d"
        projects: []          # second-brain
  - id: "2026-h2"
    period: "2026.05–"
    current: true
```

- [ ] **Step 9: Write `content/path.ja.yaml`**

```yaml
# DRAFT (Phase 1 placeholder) — copy taken from the C3 artboard; final copy in Phase 3.
# Two "next" lines are inferences, not vault quotes (spec §8): 2023 and 2025.
heading: "いまの考えは、どこから来たのか。"
nodes:
  "2023":
    label: "2023"
    doing: "everyai — バックエンドのインターン"
    thought: "「AIがあれば、何でもできるようになる」"
    next: "何でもできるなら、何をしたいのか。それを探しに外へ出た。"
  "2024":
    label: "2024"
    doing: "パブ・工場・ネットショップ"
    thought: "「面白そうだから」"
    thoughtNote: "仕事の中身より、どんな気持ちで働くかが大事。"
    next: "ほとんどの作業はAIが代われる。でも、人と向き合う仕事がしたい。"
  "2025":
    label: "2025"
    doing: "コスメ販売・日本でワーキングホリデー"
    thought: "楽しさから、一歩深く。"
    thoughtNote: "人の役に立つことがしたい。"
    next: "役に立つものを、自分の手でつくってみたくなった。"
  "2026-h1":
    label: "2026 前半"
    doing: "バイブコーディング"
    thought: "つくりながら、考えが変わっていった。"
    next: "みんなの価値の前に、自分の価値が分からなかった。だから、コードより人に会うことを選んだ。"
  "2026-a":
    label: "2026-a"
    doing: "kaouranai"
    thought: "はじめての一作。完成して「これ、なぜ作ったんだろう」。"
    next: "次は、実際に使われるものを。"
  "2026-b":
    label: "2026-b"
    doing: "プログラミング自販機"
    thought: "使われるものを目指したが、肝心の流れがうまく回らなかった。"
    next: "せめて、ここまでやったことを残そう。"
  "2026-c":
    label: "2026-c"
    doing: "imysh"
    thought: "やってきたことを整理する場所。"
    next: "みんなの価値をどう見つける？ 自分のさえ分からないのに。→ 人に会いに行った。"
  "2026-d":
    label: "2026-d"
    doing: "Second Brain"
    thought: "まず自分から。自分の価値を見つけるために。"
    next: "いまも続いている。"
  "2026-h2":
    label: "2026 後半"
    doing: "トーキングバー・工事現場"
    thought: "慣れたら、人に本心を伝えられない人になるかもしれない。"
    thoughtNote: "だから早めに、方向を変えた。"
```

- [ ] **Step 10: Write `content/path.ko.yaml`**

```yaml
# DRAFT — direct Korean rendering of path.ja.yaml (Phase 1 placeholder).
# Not reviewed by the author; Phase 3 replaces it with Korean written from the vault.
heading: "지금의 생각은, 어디서 왔는가."
nodes:
  "2023":
    label: "2023"
    doing: "everyai — 백엔드 인턴"
    thought: "“AI가 있으면 뭐든 할 수 있게 된다”"
    next: "뭐든 할 수 있다면, 무엇을 하고 싶은가. 그걸 찾으러 밖으로 나갔다."
  "2024":
    label: "2024"
    doing: "펍·공장·온라인 쇼핑몰"
    thought: "“재밌어 보여서”"
    thoughtNote: "일의 내용보다, 어떤 마음으로 일하느냐가 중요하다."
    next: "대부분의 작업은 AI가 대신할 수 있다. 그래도 사람과 마주하는 일을 하고 싶다."
  "2025":
    label: "2025"
    doing: "화장품 판매·일본 워킹홀리데이"
    thought: "즐거움에서, 한 걸음 더 깊이."
    thoughtNote: "사람에게 도움이 되는 일을 하고 싶다."
    next: "도움이 되는 것을, 내 손으로 직접 만들어 보고 싶어졌다."
  "2026-h1":
    label: "2026 전반"
    doing: "바이브 코딩"
    thought: "만들면서, 생각이 바뀌어 갔다."
    next: "모두의 가치 이전에, 내 가치를 몰랐다. 그래서 코드보다 사람을 만나는 쪽을 택했다."
  "2026-a":
    label: "2026-a"
    doing: "kaouranai"
    thought: "첫 작품. 완성하고 나서 ‘이거, 왜 만들었지’."
    next: "다음엔 실제로 쓰이는 것을."
  "2026-b":
    label: "2026-b"
    doing: "프로그래밍 자판기"
    thought: "쓰이는 것을 목표로 했지만, 정작 핵심 흐름이 잘 돌아가지 않았다."
    next: "적어도, 여기까지 한 것을 남기자."
  "2026-c":
    label: "2026-c"
    doing: "imysh"
    thought: "해 온 것을 정리하는 곳."
    next: "모두의 가치를 어떻게 찾지? 내 것조차 모르는데. → 사람을 만나러 갔다."
  "2026-d":
    label: "2026-d"
    doing: "Second Brain"
    thought: "먼저 나부터. 내 가치를 찾기 위해."
    next: "지금도 계속되고 있다."
  "2026-h2":
    label: "2026 후반"
    doing: "토킹바·공사 현장"
    thought: "익숙해지면, 사람에게 본심을 전하지 못하는 사람이 될지도 모른다."
    thoughtNote: "그래서 일찍, 방향을 바꿨다."
```

- [ ] **Step 11: Run the check — it must pass**

Run: `npm run check:content`
Expected: `content check passed`.

- [ ] **Step 12: Prove the cross-file rules fire** (scratch copy)

```bash
T=$(mktemp -d) && cp -r content "$T/c"
# 1) missing ko text for a node, 2) missing "next" on a non-current node,
# 3) reference to a project that does not exist, 4) unknown card id in ja
python3 - "$T/c" <<'PY'
import sys, re, pathlib
c = pathlib.Path(sys.argv[1])
ko = c / "path.ko.yaml"; ko.write_text(re.sub(r'  "2024":\n(    .*\n)+?(?=  "2025")', '', ko.read_text()))
ja = c / "path.ja.yaml"; ja.write_text(ja.read_text().replace('    next: "せめて、ここまでやったことを残そう。"\n', ''))
p = c / "path.yaml"; p.write_text(p.read_text().replace('projects: []          # imysh', 'projects: [imysh]'))
n = c / "now.ja.yaml"; n.write_text(n.read_text().replace('  youtube:\n', '  yt:\n'))
PY
npm run check:content -- "$T/c"; echo "exit=$?"
rm -rf "$T"
```
Expected: `exit=1` and errors for: `path.ko.yaml nodes: missing text for id "2024"`, `path.ja.yaml "2026-b": "next" (why I moved on) is required`, `path.yaml projects: unknown project "imysh"`, `now.ja.yaml cards: missing text for id "youtube"` and `…text for unknown id "yt"`.

- [ ] **Step 13: Build** (validation now covers now/path at build time too; nothing renders them yet)

```bash
npm run lint && npm run typecheck && npm run build
```
Expected: all pass; page list unchanged from Task 2.

- [ ] **Step 14: Commit**

```bash
git add lib/content content/now*.yaml content/path*.yaml
git commit -m "feat: add validated now/path content (placeholder copy, not rendered yet)"
```

---

### Task 4: remark + remark-gfm instead of next-mdx-remote

**Files:**
- Modify: `components/projects/ProjectContent.tsx`, `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `Project.body` (Task 2) via the unchanged prop `ProjectContent({ source: string })`.
- Produces: same component signature; output now supports GFM tables, never evaluates `{…}`.

- [ ] **Step 1: Confirm the defect is still present** (failing check)

```bash
npm run build >/dev/null && grep -c '| 기능 |' out/ko/projects/kigaru.html ; grep -c '<table' out/ko/projects/kigaru.html
```
Expected: `2` then `0`.

- [ ] **Step 2: Swap dependencies**

```bash
npm uninstall next-mdx-remote @types/mdx
npm install unified@^11.0.5 remark-parse@^11.0.0 remark-gfm@^4.0.1 remark-rehype@^11.1.2 hast-util-to-jsx-runtime@^2.3.6
```

- [ ] **Step 3: Replace `components/projects/ProjectContent.tsx`** — the `components` map keeps every existing className; only the renderer changes. `loading="lazy"` is added to `img` (no visual change; it also stops React 19 from emitting a `<link rel="preload">` for each of the 12 GIFs).

```tsx
import type { JSX } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";

// Plain markdown + GFM (tables, strikethrough, autolinks). No MDX: `{` in content is just text.
// Raw HTML in markdown is dropped by remark-rehype's default; content does not use any.
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

const components: Components = {
  h2: (props: JSX.IntrinsicElements["h2"]) => (
    <h2 className="text-xl font-bold text-charcoal mt-10 mb-4 pl-3 border-l-4 border-sage" {...props} />
  ),
  h3: (props: JSX.IntrinsicElements["h3"]) => (
    <h3 className="text-lg font-semibold text-charcoal mt-6 mb-3 pl-3 border-l-2 border-taupe/40" {...props} />
  ),
  p: (props: JSX.IntrinsicElements["p"]) => <p className="text-dark-gray leading-7 mb-4" {...props} />,
  pre: (props: JSX.IntrinsicElements["pre"]) => (
    <pre className="bg-light-lavender rounded-lg p-4 overflow-x-auto mb-4 text-sm font-mono" {...props} />
  ),
  code: (props: JSX.IntrinsicElements["code"]) => {
    const isInline = !props.className?.startsWith("language-");
    return (
      <code
        className={`font-mono text-sm text-charcoal${isInline ? " bg-light-lavender px-1.5 py-0.5 rounded" : ""}`}
        {...props}
      />
    );
  },
  table: (props: JSX.IntrinsicElements["table"]) => (
    <div className="overflow-x-auto mb-4">
      <table className="border-collapse w-full text-sm" {...props} />
    </div>
  ),
  th: (props: JSX.IntrinsicElements["th"]) => (
    <th className="bg-light-lavender border border-lavender px-4 py-2 text-left font-semibold text-charcoal" {...props} />
  ),
  td: (props: JSX.IntrinsicElements["td"]) => (
    <td className="border border-lavender px-4 py-2 text-dark-gray" {...props} />
  ),
  img: (props: JSX.IntrinsicElements["img"]) => (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rounded-lg shadow-sm max-w-full block mx-auto" alt={props.alt ?? ""} loading="lazy" {...props} />
      {props.alt && <figcaption className="text-center text-xs text-mid-gray mt-2">{props.alt}</figcaption>}
    </figure>
  ),
  ul: (props: JSX.IntrinsicElements["ul"]) => (
    <ul className="list-disc list-outside pl-5 mb-4 text-dark-gray space-y-1" {...props} />
  ),
  ol: (props: JSX.IntrinsicElements["ol"]) => (
    <ol className="list-decimal list-outside pl-5 mb-4 text-dark-gray space-y-1" {...props} />
  ),
  blockquote: (props: JSX.IntrinsicElements["blockquote"]) => (
    <blockquote className="border-l-4 border-lavender pl-4 my-4 text-taupe italic text-sm" {...props} />
  ),
  hr: () => <hr className="my-8 border-lavender" />,
};

interface ProjectContentProps {
  source: string;
}

export default function ProjectContent({ source }: ProjectContentProps) {
  const tree = processor.runSync(processor.parse(source));
  return <article>{toJsxRuntime(tree, { Fragment, jsx, jsxs, components })}</article>;
}
```

(This exact typing — `Components` with `JSX.IntrinsicElements[...]` props and `jsx`/`jsxs` from `react/jsx-runtime` — was compiled under `strict` with @types/react 19 during planning; it type-checks without casts.)

- [ ] **Step 4: Verify the table renders and nothing else regressed**

```bash
npm run lint && npm run typecheck && rm -rf out && npm run build
grep -c '| 기능 |' out/ko/projects/kigaru.html     # expect 0
grep -c '<table' out/ko/projects/kigaru.html      # expect 2
grep -c '<table' out/ja/projects/kigaru.html      # expect 2
grep -c '<figure' out/ko/projects/everyai.html    # expect 12 (same as before)
grep -c 'rel="preload" as="image"' out/ko/projects/everyai.html   # expect 0 (or only next/image thumbnail preloads)
grep -c 'inlineData' out/ko/projects/kigaru.html  # expect ≥1: the code block with braces still renders
grep -rn 'next-mdx-remote' app components lib package.json   # expect no output
```

Visually compare `/ko/projects/kigaru` and `/ko/projects/everyai` in `npm run dev` against the live site: headings, lists, code block, figures identical; the two tables now render as tables.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json components/projects/ProjectContent.tsx
git commit -m "feat: render markdown with remark + remark-gfm, drop next-mdx-remote"
```

---

### Task 5: Per-page metadata (title, description, canonical, absolute hreflang, OG)

**Files:**
- Create: `lib/seo.ts`
- Modify: `app/[locale]/layout.tsx` (`generateMetadata`), `app/[locale]/page.tsx`, `app/[locale]/projects/[...slug]/page.tsx`, `messages/ja.json`, `messages/ko.json`

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME`, `LOCALES`, `DEFAULT_LOCALE`, `Locale`, `assertLocale`, `loadProject`.
- Produces: `localeUrl(locale: Locale, subpath?: string): string`, `pageMetadata(input: { locale: Locale; subpath: string; title: string; description: string; type?: "website" | "article" }): Metadata`.

- [ ] **Step 1: Add the site description to messages** — add a top-level `"meta"` key to each file (other keys unchanged).

`messages/ja.json`:

```json
  "meta": {
    "siteDescription": "誰もが、自分が本当に望む価値のために生きられるように。それを手伝いたい。"
  },
```

`messages/ko.json`:

```json
  "meta": {
    "siteDescription": "누구나 자신이 정말 바라는 가치를 위해 살 수 있도록. 그걸 돕고 싶다."
  },
```

- [ ] **Step 2: Write `lib/seo.ts`**

```ts
import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/locales";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const OG_LOCALE: Record<Locale, string> = { ja: "ja_JP", ko: "ko_KR" };

// subpath: "" for the hub, "/projects/kigaru/kaouranai" for a detail page.
// No trailing slash: Cloudflare Pages serves ja.html at /ja.
export function localeUrl(locale: Locale, subpath = ""): string {
  return `${SITE_URL}/${locale}${subpath}`;
}

interface PageMetadataInput {
  locale: Locale;
  subpath: string;
  title: string; // full display title, used as-is
  description: string;
  type?: "website" | "article";
}

// Each page returns a complete set: Next merges metadata shallowly, so a child's
// openGraph would otherwise replace the parent's wholesale.
export function pageMetadata({ locale, subpath, title, description, type = "website" }: PageMetadataInput): Metadata {
  const url = localeUrl(locale, subpath);
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, localeUrl(l, subpath)]));
  languages["x-default"] = localeUrl(DEFAULT_LOCALE, subpath);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary", title, description },
  };
}
```

No `og:image` in Phase 1 — there is no image to point at yet; OG previews are checked in Phase 4.

- [ ] **Step 3: Replace `generateMetadata` in `app/[locale]/layout.tsx`** (base only; pages supply the rest). Add imports `import { getTranslations } from "next-intl/server";` (merge with the existing `next-intl/server` import) and `import { SITE_NAME, SITE_URL } from "@/lib/site";`.

```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description: t("siteDescription"),
  };
}
```

- [ ] **Step 4: Add `generateMetadata` to `app/[locale]/page.tsx`** (add imports `import type { Metadata } from "next";`, `getTranslations` from `next-intl/server`, `pageMetadata` from `@/lib/seo`, `SITE_NAME` from `@/lib/site`)

```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, subpath: "", title: SITE_NAME, description: t("siteDescription") });
}
```

- [ ] **Step 5: Add `generateMetadata` to `app/[locale]/projects/[...slug]/page.tsx`** (add imports `import type { Metadata } from "next";`, `pageMetadata` from `@/lib/seo`, `SITE_NAME` from `@/lib/site`)

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  const project = loadProject(slug, locale);
  return pageMetadata({
    locale,
    subpath: `/projects/${slug.join("/")}`,
    title: `${project.title} | ${SITE_NAME}`,
    description: project.summary,
    type: "article",
  });
}
```

- [ ] **Step 6: Verify against the static output**

```bash
npm run lint && npm run typecheck && rm -rf out && npm run build
F=out/ja/projects/everyai.html
grep -o '<title>[^<]*</title>' $F
#   <title>EveryAI - AI作品・サービス取引プラットフォーム | imysh</title>
grep -o '<link rel="canonical"[^>]*>' $F
#   href="https://imysh.pages.dev/ja/projects/everyai"
grep -io '<link rel="alternate" hreflang="[^"]*" href="[^"]*"' $F
#   ja  → https://imysh.pages.dev/ja/projects/everyai
#   ko  → https://imysh.pages.dev/ko/projects/everyai
#   x-default → https://imysh.pages.dev/ja/projects/everyai
grep -o '<meta property="og:[a-z_:]*" content="[^"]*"' $F
#   og:title, og:description, og:url (absolute), og:site_name imysh, og:locale ja_JP, og:locale:alternate ko_KR, og:type article
grep -o '<title>[^<]*</title>' out/ko.html                      # <title>imysh</title>
grep -io 'hreflang="[^"]*" href="[^"]*"' out/ko.html            # hub alternates: /ja and /ko, absolute
grep -o '<meta name="description" content="[^"]*"' out/ko/projects/kigaru/kaouranai.html
#   the ko summary of kaouranai
```

Every `href` in the alternate/canonical/og:url output must start with `https://imysh.pages.dev/`.

- [ ] **Step 7: Commit**

```bash
git add lib/seo.ts app messages
git commit -m "feat: per-page metadata with canonical, absolute hreflang and OG"
```

---

### Task 6: CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, redesign]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      # typecheck runs `next typegen` first so .next/types exists on a fresh checkout
      - run: npm run typecheck
      - run: npm run check:content
      - run: npm run build
```

- [ ] **Step 2: Reproduce the CI sequence locally from a clean state**

```bash
rm -rf .next out node_modules
npm ci && npm run lint && npm run typecheck && npm run check:content && npm run build
echo "ci-local-exit=$?"
```
Expected: `ci-local-exit=0`. (Local Node is 25; CI pins 22. Also check which Node version the Cloudflare Pages project builds with — Settings → Builds → `NODE_VERSION` — and note it in `docs/progress.md`; that is a dashboard read for the user, not a code change.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint, typecheck, content check and build on push and PR"
```

After the first push of `redesign` (only when the user authorizes pushing), confirm the run is green: `gh run list --branch redesign --limit 1`.

---

### Task 7: Rewrite the in-repo skill and CLAUDE.md for the new model

**Files:**
- Modify: `.claude/skills/portfolio-page-generator/SKILL.md` (full rewrite, English per the user's global rule), `CLAUDE.md` (sections that describe en, next-mdx-remote, PROJECTS, routing; leave the design-system section for Phase 2)

- [ ] **Step 1: Replace `.claude/skills/portfolio-page-generator/SKILL.md`** with:

````markdown
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
````

- [ ] **Step 2: Update `CLAUDE.md`** — replace these parts verbatim (everything else, including the design-system section, stays until Phase 2):

In `## 프로젝트 개요`, replace the first two paragraphs with:

```markdown
"나는 어떤 사람인가"를 보여주는 사이트. 일본에서 만나는 사람들이 대상이고,
정체성은 직무가 아니라 "만드는 사람". 기본 언어 ja, 두 번째 ko (en 없음).

- 설계: `docs/superpowers/specs/2026-10-10-imysh-redesign-design.md`
- 진행 상황: `docs/progress.md`
```

In `## 기술 스택`, replace the i18n and Markdown bullets with:

```markdown
- **i18n**: next-intl (ja 기본, ko) — 로케일 목록은 `lib/locales.ts` 한 곳
- **Markdown**: unified + remark-parse + remark-gfm + remark-rehype → React (`components/projects/ProjectContent.tsx`)
- **콘텐츠 검증**: zod (`lib/content/`), `npm run check:content`
```

In `## 빌드 & 테스트`, replace the code block with:

```bash
npm run dev            # 개발 서버 — / 는 404, /ja 로 열 것 (/ 리다이렉트는 public/_redirects, Cloudflare 전용)
npm run build          # Static Export → out/ (콘텐츠 검증 포함)
npm run lint           # ESLint
npm run typecheck      # next typegen && tsc -p tsconfig.json --noEmit
npm run check:content  # content/ 전체 검증 (두 로케일, slug·이미지 참조, enum)
```

Replace `## 디렉토리 구조` with:

````markdown
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
````

Replace `## 콘텐츠 추가 방법` with:

```markdown
## 콘텐츠 추가 방법

스킬 `.claude/skills/portfolio-page-generator/SKILL.md` 를 쓴다. 원칙: 구조는 한 곳
(`*.yaml`), 문장은 로케일별. 한 로케일이라도 빠지면 빌드가 실패한다 (다른 로케일로
대체하지 않음).
```

Replace `## 라우팅 구조` with:

```markdown
## 라우팅 구조

/ja, /ko                                 허브
/{ja,ko}/projects/kigaru                 상세
/{ja,ko}/projects/kigaru/kaouranai       하위 프로젝트

`/` 는 Cloudflare Pages `_redirects` 로 `/ja` (302). 옛 `/en/*` 는 `/ja/*` (301).
```

Replace `## 구현 마일스톤` with:

```markdown
## 구현 단계 (2026-10 리디자인)

1. Foundation — 데이터 모델·검증, remark, 로케일, 리다이렉트, 메타데이터, CI
2. Visual — C3 토큰, いま 섹션, 경로 표, 타이포, 접근성
3. Content — 볼트 → 한국어 초안 → 일본어 번역, 신규 페이지, 사진
4. Pre-launch — 실기기, OG 미리보기, Lighthouse, main 머지

`spec.md` / `prompt_plan.md` 는 2026-03 최초 구축 기록 (역사 문서).
```

- [ ] **Step 3: Verify the skill's own commands work**

```bash
npm run check:content && npm run typecheck && npm run lint && npm run build
ls out/ja/projects/everyai.html out/ko/projects/everyai.html
grep -n -E 'en\.md|PROJECTS|tsc --noEmit lib' .claude/skills/portfolio-page-generator/SKILL.md   # expect no output
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/portfolio-page-generator/SKILL.md CLAUDE.md
git commit -m "docs: rewrite page-generator skill and CLAUDE.md for the new content model"
```

---

### Task 8: Phase 1 exit check

**Files:** `docs/progress.md` (log only)

- [ ] **Step 1: Full local run**

```bash
rm -rf .next out && npm ci && npm run lint && npm run typecheck && npm run check:content && npm run build
```

- [ ] **Step 2: Exit criteria — every line must hold**

```bash
ls out | grep -E '^(en|index\.html)'                                  # nothing
test -f out/_redirects && echo ok                                     # ok
grep -c 'AIベース' out/ja.html                                         # ≥1
grep -c '<table' out/ja/projects/kigaru.html                           # 2
grep -o '<link rel="canonical"[^>]*>' out/ko/projects/kigaru/kaouranai.html   # absolute https://imysh.pages.dev/ko/projects/kigaru/kaouranai
grep -rn -E 'next-mdx-remote|lib/projects|"en"' app components lib package.json   # nothing
git status --short                                                    # clean (if committing)
```

- [ ] **Step 3: Preview deploy check** (only if the user authorizes `git push -u origin redesign`)

Cloudflare Pages builds a preview for the branch (`https://redesign.imysh.pages.dev` or the URL shown in the Pages dashboard). Check:

```bash
P=https://redesign.imysh.pages.dev
curl -sI $P/ | grep -i -E '^(HTTP|location)'          # 302, location: /ja
curl -sI $P/en/projects/kigaru | grep -i -E '^(HTTP|location)'   # 301, location: /ja/projects/kigaru
curl -s  $P/ja/projects/kigaru | grep -c '<table'      # 2
gh run list --branch redesign --limit 1                # CI green
```

If `curl -sI $P/` returns 200 instead of 302, `_redirects` is not being applied — stop and report before Phase 2.

- [ ] **Step 4: Update `docs/progress.md`** — rewrite `## Where things stand (YYYY-MM-DD)`, check off the Phase 1 items under `## Next`, and add a `## Log` line at the top.

---

## Out of scope for Phase 1 (do not do here)

Role tokens, Zen Maru Gothic / Pretendard via `next/font`, `word-break: keep-all`, focus-visible, touch targets, rendering now/path, detail-page section order, ProjectNav arrow direction, `npm run images` (sharp, webp widths), replacing the everyai GIFs, README, OG images. These are Phase 2–4 per spec §7.
