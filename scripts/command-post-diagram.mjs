// Usage: node scripts/command-post-diagram.mjs
// Draws the command post page's flow diagram (C3 tokens) in ja and ko and writes it to
// images-src/projects/command-post/flow-{ja,ko}.svg with every label outlined; then run `npm run images`.
// Fonts and outlining: scripts/diagram-text.mjs.
import fs from "node:fs";
import path from "node:path";
import { C, fontsFor, textPath } from "./diagram-text.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "images-src", "projects", "command-post");
fs.mkdirSync(OUT, { recursive: true });

const TEXT = {
  ja: {
    me: ["自分", "決める・承認する"],
    post: ["司令塔", "状況板・ルール・承認"],
    each: "プロジェクトごとに ひとつ",
    agent: ["サブエージェント", "進行ファイル"],
    perm: "ラウンドごとの権限",
    steps: ["計画だけ", "変更（コミットなし）", "ローカルコミット"],
    out: ["外に出ることは", "司令塔からだけ", "push・デプロイ・公開"],
    smoke: ["スモークテストで", "はじめて完了"],
    rec: ["記録は", "承認のあとで"],
  },
  ko: {
    me: ["나", "정하고, 승인한다"],
    post: ["지휘본부", "상황판 · 규칙 · 승인"],
    each: "프로젝트마다 하나",
    agent: ["서브에이전트", "진행 파일"],
    perm: "라운드마다 권한",
    steps: ["계획만", "변경 (커밋 없이)", "로컬 커밋"],
    out: ["밖으로 나가는 일은", "지휘본부에서만", "push · 배포 · 공개"],
    smoke: ["스모크 테스트까지", "해야 끝"],
    rec: ["기록은", "승인한 뒤에"],
  },
};
const card = (x, y, w, h, fill, stroke, sw = 1.5, rx = 18) => `
  <rect x="${x}" y="${y + 5}" width="${w}" height="${h}" rx="${rx}" fill="#5A4632" opacity=".06"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const arrow = (x1, y1, x2, y2, color = C.muted, dash = "") => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  const p1 = [x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)], p2 = [x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)];
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>
  <path d="M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L ${x2} ${y2} L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
};

for (const [lang, t] of Object.entries(TEXT)) {
  const { regular: R, bold: B } = fontsFor(lang);
  const parts = [];
  // 1. me
  parts.push(card(320, 40, 280, 92, C.surface, C.border));
  parts.push(textPath(B, t.me[0], 460, 82, 30, C.text, "middle"));
  parts.push(textPath(R, t.me[1], 460, 114, 18, C.soft, "middle"));
  parts.push(arrow(460, 136, 460, 176));
  // 2. the command post (the accent: it is the centre)
  parts.push(card(100, 182, 720, 110, C.tint, C.accent, 2, 22));
  parts.push(textPath(B, t.post[0], 460, 232, 36, C.text, "middle"));
  parts.push(textPath(R, t.post[1], 460, 268, 19, C.soft, "middle"));
  // 3. one subagent per project
  const xs = [100, 350, 600];
  parts.push(textPath(R, t.each, 460, 482, 16, C.muted, "middle"));
  for (const x of xs) {
    const cx = x + 110;
    if (cx === 460) parts.push(arrow(460, 296, 460, 352));
    else {
      parts.push(`<path d="M 460 296 C 460 326, ${cx} 318, ${cx} 348" stroke="${C.muted}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
      parts.push(arrow(cx, 340, cx, 352));
    }
    parts.push(card(x, 358, 220, 100, C.surface, C.border));
    parts.push(textPath(B, t.agent[0], x + 110, 398, 21, C.text, "middle"));
    parts.push(`<rect x="${x + 56}" y="${414}" width="108" height="28" rx="14" fill="${C.sub}" stroke="${C.border}"/>`);
    parts.push(textPath(R, t.agent[1], x + 110, 434, 15, C.soft, "middle"));
  }
  // 4. permissions per round
  parts.push(textPath(B, t.perm, 100, 516, 18, C.text));
  const pw = [190, 240, 210], gap = 40;
  let px = 100;
  t.steps.forEach((s, i) => {
    parts.push(`<rect x="${px}" y="528" width="${pw[i]}" height="46" rx="23" fill="${C.surface}" stroke="${i === 2 ? C.accent : C.border}" stroke-width="${i === 2 ? 2 : 1.5}"/>`);
    parts.push(textPath(i === 2 ? B : R, s, px + pw[i] / 2, 558, 18, C.text, "middle"));
    if (i < 2) parts.push(arrow(px + pw[i] + 6, 551, px + pw[i] + gap - 6, 551));
    px += pw[i] + gap;
  });
  // side lane: what leaves the machine, and records
  parts.push(arrow(822, 237, 872, 237, C.accentText));
  parts.push(card(878, 172, 292, 132, C.surface, C.accentText, 1.6));
  parts.push(textPath(B, t.out[0], 1024, 214, 20, C.text, "middle"));
  parts.push(textPath(B, t.out[1], 1024, 244, 20, C.accentText, "middle"));
  parts.push(textPath(R, t.out[2], 1024, 280, 15, C.soft, "middle"));
  parts.push(arrow(1024, 308, 1024, 352, C.accentText));
  parts.push(card(878, 358, 292, 96, C.surface, C.border));
  parts.push(textPath(B, t.smoke[0], 1024, 398, 19, C.text, "middle"));
  parts.push(textPath(R, t.smoke[1], 1024, 428, 17, C.soft, "middle"));
  parts.push(`<path d="M 822 276 C 852 300, 852 560, 872 594" stroke="${C.muted}" stroke-width="1.6" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>`);
  parts.push(card(878, 548, 292, 92, C.sub, C.border));
  parts.push(textPath(B, t.rec[0], 1024, 586, 19, C.text, "middle"));
  parts.push(textPath(R, t.rec[1], 1024, 616, 17, C.soft, "middle"));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 690" width="1200" height="690">
  <rect width="1200" height="690" fill="${C.bg}"/>${parts.join("")}
</svg>
`;
  const file = path.join(OUT, `flow-${lang}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`${path.relative(ROOT, file)}  ${(svg.length / 1024).toFixed(0)} KB`);
}
