// Usage: npm run fonts
// Subsets the site fonts to exactly the characters the site uses, so each page loads
// two or four small files instead of ~50 unicode-range slices (Lighthouse, 2026-10-10).
//   Zen Maru Gothic (ja + kana/kanji everywhere): fonts-src/ZenMaruGothic-{Regular,Bold}.ttf
//     — downloaded once from github.com/google/fonts if missing (dev only; gitignored, OFL).
//   Pretendard (ko: Hangul + Latin): node_modules/pretendard/dist/public/static/*.otf
// Outputs app/fonts/*.woff2 and app/fonts.css (both committed, generated) and
// lib/content/font-charset.json, which check:content uses to fail the build when new text needs a re-run.
//
// Zen Maru Gothic is split by page per weight (2026-10-10, /ja mobile Lighthouse), using unicode-range:
//   hub     — characters of the hub's text (now/path/messages/project titles, both locales) + base punctuation
//   <slug>  — characters only that project's page uses
//   shared  — everything else (characters several project pages share), the catch-all
// The browser fetches a file only when the page shows one of its characters, so the hub loads about
// half the Japanese bytes it did with one file, and a project page loads hub + shared + its own file.
import fs from "fs";
import path from "path";
import subsetFont from "subset-font";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "app", "fonts");
const SRC = path.join(ROOT, "fonts-src");
const ZEN_URL = "https://github.com/google/fonts/raw/main/ofl/zenmarugothic";

function walk(dir: string, exts: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, exts);
    return exts.some((x) => e.name.endsWith(x)) ? [full] : [];
  });
}

const isHangul = (c: number) =>
  (c >= 0xac00 && c <= 0xd7a3) || (c >= 0x1100 && c <= 0x11ff) || (c >= 0x3130 && c <= 0x318f);

export function siteText(root = ROOT): string {
  const files = [
    ...walk(path.join(root, "content"), [".yaml", ".md"]),
    ...walk(path.join(root, "messages"), [".json"]),
    ...walk(path.join(root, "components"), [".tsx"]),
  ];
  return files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
}

// Printable ASCII plus punctuation that UI or future copy commonly needs.
const BASE =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") +
  "、。・ー〜「」『』（）！？：；…—–‘’“”→←↑↓＋×·";

export function charsets(text: string) {
  const all = new Set([...BASE, ...text].filter((ch) => ch.codePointAt(0)! >= 32));
  const ja = [...all].filter((ch) => !isHangul(ch.codePointAt(0)!)).sort().join("");
  const ko = [...all]
    .filter((ch) => isHangul(ch.codePointAt(0)!) || ch.codePointAt(0)! < 0x3000)
    .sort()
    .join("");
  return { ja, ko };
}

async function ensureZen(name: string): Promise<Buffer> {
  const file = path.join(SRC, name);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(SRC, { recursive: true });
    const res = await fetch(`${ZEN_URL}/${name}`);
    if (!res.ok) throw new Error(`download failed: ${name} (${res.status})`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return fs.readFileSync(file);
}

// Text the hub (/ja, /ko) can show: its two content files per locale, UI strings and project titles.
export function hubText(root = ROOT): string {
  const content = path.join(root, "content");
  const files = [
    ...["now", "path"].flatMap((n) => fs.readdirSync(content).filter((f) => f.startsWith(n + ".")).map((f) => path.join(content, f))),
    ...walk(path.join(root, "messages"), [".json"]),
  ];
  const titles = walk(path.join(content, "projects"), [".md"]).map((f) => /^title:\s*(.*)$/m.exec(fs.readFileSync(f, "utf8"))?.[1] ?? "");
  return files.map((f) => fs.readFileSync(f, "utf8")).join("\n") + titles.join("\n");
}

// "U+20-7E,U+3001-3002,…" for a sorted set of characters.
function unicodeRange(chars: string): string {
  const cps = [...new Set([...chars].map((c) => c.codePointAt(0)!))].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < cps.length; i++) {
    let j = i;
    while (j + 1 < cps.length && cps[j + 1] === cps[j] + 1) j++;
    const hex = (n: number) => n.toString(16).toUpperCase();
    parts.push(j > i ? `U+${hex(cps[i])}-${hex(cps[j])}` : `U+${hex(cps[i])}`);
    i = j;
  }
  return parts.join(",");
}

const face = (family: string, weight: number, file: string, range?: string) =>
  `@font-face {
  font-family: "${family}";
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url("./fonts/${file}") format("woff2");${range ? `\n  unicode-range: ${range};` : ""}
}`;

// Characters each project page shows beyond the hub: its own markdown in both locales.
function projectTexts(root = ROOT): Map<string, string> {
  const dir = path.join(root, "content", "projects");
  const byProject = new Map<string, string>();
  for (const f of walk(dir, [".md"])) {
    const slug = path.relative(dir, path.dirname(f)).split(path.sep).join("-");
    byProject.set(slug, (byProject.get(slug) ?? "") + fs.readFileSync(f, "utf8"));
  }
  return byProject;
}

async function main() {
  const { ja, ko } = charsets(siteText());
  const hubSet = new Set(hubText());
  // The hub file: hub text plus ASCII and the base punctuation (small, used everywhere, also by ko pages).
  const jaHub = [...ja].filter((c) => hubSet.has(c) || BASE.includes(c)).join("");
  const rest = [...ja].filter((c) => !jaHub.includes(c));
  // Split the rest by project page: characters only one project uses go into that project's file,
  // everything else (shared by several pages, or not attributed) into one shared catch-all file.
  const users = new Map<string, string[]>();
  for (const [slug, text] of projectTexts()) for (const c of new Set(text)) if (rest.includes(c)) users.set(c, [...(users.get(c) ?? []), slug]);
  const own = new Map<string, string>();
  for (const [c, slugs] of users) if (slugs.length === 1) own.set(slugs[0], (own.get(slugs[0]) ?? "") + c);
  const shared = rest.filter((c) => (users.get(c)?.length ?? 0) !== 1).join("");

  const pretendard = path.join(ROOT, "node_modules/pretendard/dist/public/static");
  const zen = { 400: await ensureZen("ZenMaruGothic-Regular.ttf"), 700: await ensureZen("ZenMaruGothic-Bold.ttf") };
  const jobs: [string, Buffer, string][] = [];
  const faces: string[] = [];
  for (const w of [400, 700] as const) {
    // Order matters: for a character the last matching rule wins. The shared file comes first without
    // a range (catch-all); each project file and the hub file claim only their own ranges.
    jobs.push([`zen-maru-gothic-${w}-shared.woff2`, zen[w], shared]);
    faces.push(face("Zen Maru Gothic", w, `zen-maru-gothic-${w}-shared.woff2`));
    for (const [slug, chars] of [...own].sort()) {
      jobs.push([`zen-maru-gothic-${w}-${slug}.woff2`, zen[w], chars]);
      faces.push(face("Zen Maru Gothic", w, `zen-maru-gothic-${w}-${slug}.woff2`, unicodeRange(chars)));
    }
    jobs.push([`zen-maru-gothic-${w}-hub.woff2`, zen[w], jaHub]);
    faces.push(face("Zen Maru Gothic", w, `zen-maru-gothic-${w}-hub.woff2`, unicodeRange(jaHub)));
  }
  jobs.push(["pretendard-400.woff2", fs.readFileSync(path.join(pretendard, "Pretendard-Regular.otf")), ko]);
  jobs.push(["pretendard-700.woff2", fs.readFileSync(path.join(pretendard, "Pretendard-Bold.otf")), ko]);
  faces.push(face("Pretendard", 400, "pretendard-400.woff2"), face("Pretendard", 700, "pretendard-700.woff2"));

  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith(".woff2")) fs.rmSync(path.join(OUT, f)); // no stale files
  for (const [name, source, text] of jobs) {
    const out = await subsetFont(source, text, { targetFormat: "woff2" });
    fs.writeFileSync(path.join(OUT, name), out);
    console.log(`${name}  ${(out.length / 1024).toFixed(0)} KB  (${[...text].length} chars)`);
  }
  const css = [
    "/* GENERATED by `npm run fonts` (scripts/fonts.ts). Do not edit by hand.",
    "   Self-hosted, site-specific subsets; never next/font/google (fe46a84).",
    "   Zen Maru Gothic is split by page (hub / one file per project / shared), see scripts/fonts.ts. */",
    ...faces,
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "app", "fonts.css"), css + "\n");
  console.log(`app/fonts.css  ${(css.length / 1024).toFixed(1)} KB`);
  fs.writeFileSync(
    path.join(ROOT, "lib", "content", "font-charset.json"),
    JSON.stringify({ ja, ko }, null, 0) + "\n",
  );
}

if (process.argv[1]?.endsWith("fonts.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
