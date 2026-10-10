// Usage: npm run og   (also runs automatically before `npm run build`)
// Renders one 1200x630 Open Graph card per page into public/og/ (gitignored):
//   public/og/<locale>.png                      hub
//   public/og/<locale>/projects/<slug...>.png   project pages
// satori lays out the card and turns text into vector paths; sharp rasterises the SVG.
// Fonts come from npm (no network): Zen Maru Gothic subsets and Pretendard.
import fs from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";
import { LOCALES, type Locale } from "../lib/locales";
import { listProjectSlugPaths, loadProject } from "../lib/content/projects";
import { loadNowText } from "../lib/content/profile";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "og");
const W = 1200;
const H = 630;

// C3 tokens (app/globals.css).
const C = {
  bg: "#F7F4EF",
  surface: "#FFFFFF",
  text: "#2E2A27",
  soft: "#4A433E",
  muted: "#6A625B",
  accentText: "#B44A30",
  accent: "#E9B8A6",
};

type Font = { name: string; data: Buffer; weight: 400 | 700; style: "normal" };

// Zen Maru Gothic ships as ~120 unicode-range slices; load only the slices a card needs.
interface Slice {
  file: string;
  ranges: [number, number][];
}
function readSlices(weight: 400 | 700): Slice[] {
  const dir = path.join(ROOT, "node_modules/@fontsource/zen-maru-gothic");
  const css = fs.readFileSync(path.join(dir, `${weight}.css`), "utf8");
  return css
    .split("@font-face")
    .slice(1)
    .map((block) => {
      const file = /url\(\.\/files\/([^)]+\.woff)\)/.exec(block)?.[1];
      const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1] ?? "";
      const ranges = range.split(",").map((r): [number, number] => {
        const [a, b] = r.trim().replace(/^U\+/i, "").split("-");
        return [parseInt(a, 16), parseInt(b ?? a, 16)];
      });
      return { file: path.join(dir, "files", file ?? ""), ranges };
    })
    .filter((s) => s.file.endsWith(".woff"));
}
const SLICES = { 400: readSlices(400), 700: readSlices(700) };
const PRETENDARD = {
  400: fs.readFileSync(path.join(ROOT, "node_modules/pretendard/dist/public/static/Pretendard-Regular.otf")),
  700: fs.readFileSync(path.join(ROOT, "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf")),
};
const fileCache = new Map<string, Buffer>();

// Returns the fonts plus, per weight, the family list in fallback order. satori uses one font per
// (name, weight) and falls back across the families listed in fontFamily, so each slice gets its
// own family name. ja: Zen Maru Gothic first (Pretendard only for Hangul). ko: Pretendard for
// Hangul and Latin, Zen Maru Gothic for kana and kanji (so a Japanese name is not mixed).
function fontsFor(text: string, locale: Locale): { fonts: Font[]; family: Record<400 | 700, string> } {
  const codes = [...new Set([...text].map((ch) => ch.codePointAt(0)!))];
  const fonts: Font[] = [];
  const family = { 400: "", 700: "" } as Record<400 | 700, string>;
  for (const weight of [400, 700] as const) {
    const cjk: string[] = [];
    const latin: string[] = [];
    for (const slice of SLICES[weight]) {
      if (!codes.some((c) => slice.ranges.some(([a, b]) => c >= a && c <= b))) continue;
      if (!fileCache.has(slice.file)) fileCache.set(slice.file, fs.readFileSync(slice.file));
      const name = `ZMG-${path.basename(slice.file, ".woff")}`;
      fonts.push({ name, data: fileCache.get(slice.file)!, weight, style: "normal" });
      const isLatin = slice.ranges.some(([a, b]) => 0x41 >= a && 0x41 <= b);
      (isLatin ? latin : cjk).push(name);
    }
    fonts.push({ name: "Pretendard", data: PRETENDARD[weight], weight, style: "normal" });
    const order = locale === "ja" ? [...latin, ...cjk, "Pretendard"] : ["Pretendard", ...cjk, ...latin];
    family[weight] = order.join(", ");
  }
  return { fonts, family };
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

function card(family: Record<400 | 700, string>, locale: Locale, kicker: string, title: string, sub: string): Node {
  return h(
    "div",
    { width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: family[400] },
    h(
      "div",
      {
        // satori sizes are content-box: subtract the 64/56px padding from the 48px-inset card.
        width: W - 96 - 128,
        height: H - 96 - 112,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: C.surface,
        borderRadius: 28,
        padding: "56px 64px",
      },
      [
        h("div", { display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 700, color: C.text, fontFamily: family[700] }, [
          h("div", { width: 22, height: 22, borderRadius: 11, background: C.accent }),
          h("div", { display: "flex" }, "IMYSH"),
          h("div", { display: "flex", marginLeft: 12, fontSize: 24, fontWeight: 400, color: C.muted, fontFamily: family[400] }, kicker),
        ]),
        h("div", { display: "flex", flexDirection: "column", gap: 24 }, [
          h("div", { display: "flex", fontSize: title.length > 24 ? 54 : 68, fontWeight: 700, lineHeight: 1.3, color: C.text, fontFamily: family[700] }, title),
          h("div", { display: "flex", fontSize: 30, lineHeight: 1.6, color: C.soft }, sub),
        ]),
        h("div", { display: "flex", justifyContent: "space-between", fontSize: 24, color: C.accentText }, [
          h("div", { display: "flex" }, "imysh.pages.dev"),
          h("div", { display: "flex", color: C.muted }, locale.toUpperCase()),
        ]),
      ],
    ),
  );
}

async function render(file: string, locale: Locale, kicker: string, title: string, sub: string) {
  const { fonts, family } = fontsFor(`IMYSH imysh.pages.dev JAKO ${kicker}${title}${sub}`, locale);
  const svg = await satori(card(family, locale, kicker, title, sub) as never, { width: W, height: H, fonts });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  let count = 0;
  for (const locale of LOCALES) {
    const now = loadNowText(locale);
    const statement = `${now.statement.before}${now.statement.accent}${now.statement.after}`.replace(/\s+/g, " ").trim();
    await render(path.join(OUT, `${locale}.png`), locale, "", statement, now.thinking[now.thinking.length - 1]);
    count++;
    for (const slugPath of listProjectSlugPaths()) {
      const project = loadProject(slugPath, locale);
      await render(
        path.join(OUT, locale, "projects", ...slugPath) + ".png",
        locale,
        project.meta.period,
        project.title,
        project.summary,
      );
      count++;
    }
  }
  console.log(`og: ${count} cards → ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
