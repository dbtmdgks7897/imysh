import fs from "fs";
import path from "path";
import { LOCALES } from "@/lib/locales";
import { CONTENT_ROOT, PUBLIC_ROOT } from "./paths";
import { ContentError } from "./read";
import { listProjectSlugPaths, loadProjectMeta, loadProjectText } from "./projects";
import { splitH2 } from "./sections";
import { isKnownImage } from "./images";
import fontCharset from "./font-charset.json";
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
  if (!ref) return;
  if (!fs.existsSync(path.join(publicRoot, ref))) {
    errors.push(`${where}: image not found in public/: ${ref}`);
  } else if (!isKnownImage(ref)) {
    errors.push(`${where}: ${ref} is not in lib/content/image-manifest.json (run npm run images)`);
  }
}

const MD_IMAGE = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;

const FONT_JA = new Set([...fontCharset.ja]);
const FONT_KO = new Set([...fontCharset.ko]);
const isHangul = (c: number) =>
  (c >= 0xac00 && c <= 0xd7a3) || (c >= 0x1100 && c <= 0x11ff) || (c >= 0x3130 && c <= 0x318f);

// The fonts are subset to the site's characters (npm run fonts). New text with a character
// outside the subset would render in a fallback font, so it fails the check instead.
function checkGlyphs(errors: string[], where: string, text: string) {
  const missing = new Set<string>();
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c < 32 || ch === "\n") continue;
    if (isHangul(c) ? !FONT_KO.has(ch) : !FONT_JA.has(ch)) missing.add(ch);
  }
  if (missing.size > 0) {
    errors.push(`${where}: characters not in the font subset (run npm run fonts): ${[...missing].join("")}`);
  }
}

// Draft markers like 【본인 확인: …】 must never reach the site.
function checkNoDraftMarkers(errors: string[], where: string, text: string) {
  if (text.includes("【")) errors.push(`${where}: contains a draft marker "【"`);
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
    let sectionCount: number | null = null;
    attempt(errors, () => {
      const meta = loadProjectMeta(slugPath, root);
      checkImage(errors, meta.thumbnail, `projects/${slug}/meta.yaml thumbnail`, publicRoot);
      checkImage(errors, meta.hero, `projects/${slug}/meta.yaml hero`, publicRoot);
      sectionCount = meta.sections.length;
    });
    for (const locale of LOCALES) {
      attempt(errors, () => {
        const { title, summary, role, heroAlt, body } = loadProjectText(slugPath, locale, root);
        const { preamble, parts } = splitH2(body);
        const where = `projects/${slug}/${locale}.md`;
        checkNoDraftMarkers(errors, where, [title, summary, role ?? "", heroAlt ?? "", body].join("\n"));
        checkGlyphs(errors, where, [title, summary, role ?? "", heroAlt ?? "", body].join("\n"));
        for (const match of body.matchAll(MD_IMAGE)) {
          const src = match[1];
          if (!src.startsWith("/images/")) errors.push(`${where}: image must be a local /images/ path: ${src}`);
          else checkImage(errors, src, `${where} image`, publicRoot);
        }
        if (preamble) errors.push(`${where}: text before the first "## " heading would not be shown`);
        if (sectionCount !== null && parts.length !== sectionCount) {
          errors.push(
            `${where}: ${parts.length} "## " headings but meta.yaml sections lists ${sectionCount}`,
          );
        }
      });
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
        checkNoDraftMarkers(errors, `now.${locale}.yaml`, JSON.stringify(text));
        checkGlyphs(errors, `now.${locale}.yaml`, JSON.stringify(text));
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
        checkNoDraftMarkers(errors, `path.${locale}.yaml`, JSON.stringify(text));
        checkGlyphs(errors, `path.${locale}.yaml`, JSON.stringify(text));
        compareIds(errors, `path.${locale}.yaml nodes`, ids, Object.keys(text.nodes));
        // "next" is required on top-level rows (the hand-off between periods); sub-rows may omit it.
        for (const id of data.nodes.map((n) => n.id)) {
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
