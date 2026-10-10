// Shared by the detail-page diagrams (scripts/*-diagram.mjs): C3 colours and labels drawn as outlines,
// so `npm run images` (sharp/librsvg) renders them without the site fonts installed.
// Fonts: fonts-src/ZenMaruGothic-*.ttf (ja; `npm run fonts` downloads them) and Pretendard OTF (ko).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const hb = await require("harfbuzzjs");
const ROOT = process.cwd();

export const C = { bg: "#F7F4EF", surface: "#FFFFFF", sub: "#FBF8F4", text: "#2E2A27", muted: "#6A625B", soft: "#4A433E", border: "#E3DDD3", accentText: "#B44A30", accent: "#E9B8A6", tint: "#F6DDD2" };

const FILES = {
  ja: { regular: "fonts-src/ZenMaruGothic-Regular.ttf", bold: "fonts-src/ZenMaruGothic-Bold.ttf" },
  ko: { regular: "node_modules/pretendard/dist/public/static/Pretendard-Regular.otf", bold: "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf" },
};

function loadFont(file) {
  const face = hb.createFace(hb.createBlob(fs.readFileSync(path.join(ROOT, file))), 0);
  return { font: hb.createFont(face), upem: face.upem };
}

/** { regular, bold } fonts for a locale. */
export function fontsFor(lang) {
  return { regular: loadFont(FILES[lang].regular), bold: loadFont(FILES[lang].bold) };
}

/** One line of text as outlined glyphs (an SVG <g>). anchor: "start" | "middle" | "end". */
export function textPath(f, str, x, y, size, fill, anchor = "start") {
  const buf = hb.createBuffer();
  buf.addText(str);
  buf.guessSegmentProperties();
  hb.shape(f.font, buf);
  const glyphs = buf.json();
  buf.destroy();
  const k = size / f.upem;
  const width = glyphs.reduce((w, g) => w + g.ax, 0) * k;
  let pen = anchor === "end" ? x - width : anchor === "middle" ? x - width / 2 : x;
  const parts = [];
  for (const g of glyphs) {
    const d = f.font.glyphToPath(g.g);
    if (d) parts.push(`<path transform="translate(${(pen + g.dx * k).toFixed(2)} ${(y - g.dy * k).toFixed(2)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})" d="${d}"/>`);
    pen += g.ax * k;
  }
  return `<g fill="${fill}">${parts.join("")}</g>`;
}
