// Usage: npm run fonts
// Subsets the site fonts to exactly the characters the site uses, so each page loads
// two or four small files instead of ~50 unicode-range slices (Lighthouse, 2026-10-10).
//   Zen Maru Gothic (ja + kana/kanji everywhere): fonts-src/ZenMaruGothic-{Regular,Bold}.ttf
//     — downloaded once from github.com/google/fonts if missing (dev only; gitignored, OFL).
//   Pretendard (ko: Hangul + Latin): node_modules/pretendard/dist/public/static/*.otf
// Outputs app/fonts/*.woff2 (committed) and lib/content/font-charset.json, which
// check:content uses to fail the build when new text needs a re-run.
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

async function main() {
  const { ja, ko } = charsets(siteText());
  const pretendard = path.join(ROOT, "node_modules/pretendard/dist/public/static");
  const jobs: [string, Buffer, string][] = [
    ["zen-maru-gothic-400.woff2", await ensureZen("ZenMaruGothic-Regular.ttf"), ja],
    ["zen-maru-gothic-700.woff2", await ensureZen("ZenMaruGothic-Bold.ttf"), ja],
    ["pretendard-400.woff2", fs.readFileSync(path.join(pretendard, "Pretendard-Regular.otf")), ko],
    ["pretendard-700.woff2", fs.readFileSync(path.join(pretendard, "Pretendard-Bold.otf")), ko],
  ];
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, source, text] of jobs) {
    const out = await subsetFont(source, text, { targetFormat: "woff2" });
    fs.writeFileSync(path.join(OUT, name), out);
    console.log(`${name}  ${(out.length / 1024).toFixed(0)} KB  (${[...text].length} chars)`);
  }
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
