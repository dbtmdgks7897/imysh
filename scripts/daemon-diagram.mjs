// Usage: node scripts/daemon-diagram.mjs
// Draws the daemon page's three-layer diagram (C3 tokens) in ja and ko and writes it to
// images-src/projects/daemon/layers-{ja,ko}.svg with every label converted to outlines, so
// `npm run images` (sharp/librsvg) renders it without the site fonts installed.
// Fonts and outlining: scripts/diagram-text.mjs.
import fs from "node:fs";
import path from "node:path";
import { C, fontsFor, textPath } from "./diagram-text.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "images-src", "projects", "daemon");

const TEXT = {
  ja: {
    top: ["AIの機能", "疲れない・忘れない・いつでもいる"],
    mid: ["デーモン自身", "自分を主語に立てる。話し方も、向き合い方も自分のもの"],
    bot: ["価値", "土台。ここだけ、自分から来る"],
    side: ["自分に", "似なくていい"],
    keep: "入れるのではなく、守る",
  },
  ko: {
    top: ["AI 기능", "안 지친다 · 안 잊는다 · 늘 있다"],
    mid: ["데몬 자신", "스스로를 주어로 세운다. 말투도, 대하는 방식도 데몬의 것"],
    bot: ["가치", "바닥. 여기만 나에게서 온다"],
    side: ["나를 닮지", "않아도 된다"],
    keep: "넣는 게 아니라 지킨다",
  },
};

fs.mkdirSync(OUT, { recursive: true });
for (const [lang, t] of Object.entries(TEXT)) {
  const { regular: R, bold: B } = fontsFor(lang);
  const band = (y, x, w, h, fill, stroke, [name, note], strong) => `
  <rect x="${x}" y="${y + 6}" width="${w}" height="${h}" rx="22" fill="#5A4632" opacity=".06"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="${stroke}" stroke-width="${strong ? 2 : 1.5}"/>
  ${textPath(B, name, x + 44, y + h / 2 - 4, 40, C.text)}
  ${textPath(R, note, x + 44, y + h / 2 + 36, 21, C.soft)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <rect width="1200" height="750" fill="${C.bg}"/>
  ${band(92, 250, 640, 150, C.sub, C.border, t.top)}
  ${band(272, 190, 760, 170, C.surface, C.border, t.mid)}
  ${band(472, 120, 900, 190, C.tint, C.accent, t.bot, true)}
  <path d="M 990 104 q 18 0 18 18 v 290 q 0 18 -18 18" fill="none" stroke="${C.muted}" stroke-width="1.6" stroke-dasharray="2 6" stroke-linecap="round"/>
  ${textPath(R, t.side[0], 1026, 252, 20, C.muted)}
  ${textPath(R, t.side[1], 1026, 282, 20, C.muted)}
  <rect x="104" y="456" width="932" height="222" rx="30" fill="none" stroke="${C.accentText}" stroke-width="1.8" stroke-dasharray="1 9" stroke-linecap="round"/>
  <circle cx="1036" cy="567" r="7" fill="${C.accentText}"/>
  ${textPath(B, t.keep, 1020, 706, 22, C.accentText, "end")}
</svg>
`;
  const file = path.join(OUT, `layers-${lang}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`${path.relative(ROOT, file)}  ${(svg.length / 1024).toFixed(0)} KB`);
}
