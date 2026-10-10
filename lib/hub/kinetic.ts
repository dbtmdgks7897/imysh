// The central sentence, character by character (concept A2 + B's sentence effect).
// The server-rendered sentence is what paints first (LCP); after hydration it is split into
// per-character spans. The heading keeps its full text as aria-label and the pieces are
// aria-hidden. On arrival every character exhales along its own heading and they gather again;
// the cursor (or a tap) pushes nearby characters, each in its own direction, and they return.
// Not started at all under reduced motion.

interface Ch { el: HTMLSpanElement; i: number; cx: number; cy: number; D: number; x: number; y: number; ox: number; oy: number; vx: number; vy: number }

const GLUE = "。、」）』！？"; // punctuation stays with the previous character: no line starts with 。
const OUT_MS = 380, IN_MS = 1100, STAGGER = 14;

export function startKinetic(heading: HTMLElement, area: HTMLElement): { gathered: Promise<void>; stop: () => void } {
  const original = Array.from(heading.childNodes);
  const full = heading.textContent ?? "";
  const kin = document.createElement("span");
  kin.setAttribute("aria-hidden", "true");
  const chars: Ch[] = [];
  // Korean breaks lines only between words (keep-all): characters of one word sit in a no-wrap
  // group and the spaces stay real spaces. Japanese has no spaces, so each character stands alone.
  const byWord = /\s/.test(full);
  let group: HTMLSpanElement | null = null;
  let lastChar: HTMLSpanElement | null = null;
  for (const n of original) {
    const accentClass = n.nodeType === 1 ? (n as HTMLElement).className : "";
    for (const ch of Array.from(n.textContent ?? "")) {
      if (/\s/.test(ch)) { kin.appendChild(document.createTextNode(ch)); group = null; continue; }
      if (GLUE.includes(ch) && lastChar) { lastChar.textContent += ch; continue; }
      const s = document.createElement("span");
      s.className = `kin-c ${accentClass}`.trim();
      s.textContent = ch;
      if (byWord) {
        if (!group) { group = document.createElement("span"); group.className = "kin-w"; kin.appendChild(group); }
        group.appendChild(s);
      } else kin.appendChild(s);
      lastChar = s;
    }
  }
  heading.setAttribute("aria-label", full);
  heading.replaceChildren(kin);
  Array.from(kin.querySelectorAll<HTMLSpanElement>(".kin-c")).forEach((el, i) => {
    const a = Math.random() * Math.PI * 2;
    chars.push({ el, i, cx: Math.cos(a), cy: Math.sin(a), D: 26 + Math.random() * 54, x: 0, y: 0, ox: 0, oy: 0, vx: 0, vy: 0 });
  });

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let raf = 0, ptr: [number, number] | null = null, gathered = false, t0 = performance.now() + 250;
  let resolve!: () => void;
  const done = new Promise<void>((r) => (resolve = r));
  const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));

  const measure = () => {
    const sy = scrollY;
    for (const c of chars) {
      const r = c.el.getBoundingClientRect();
      c.x = r.left + r.width / 2 - c.ox;
      c.y = r.top + sy + r.height / 2 - c.oy;
    }
  };
  const frame = (now: number) => {
    raf = 0;
    let busy = false;
    const R = 140, px = ptr ? ptr[0] : -1e5, py = ptr ? ptr[1] + scrollY : -1e5;
    for (const c of chars) {
      let gx = 0, gy = 0, op = 1;
      if (!gathered) {
        const t = now - t0 - c.i * STAGGER;
        if (t > 0 && t < OUT_MS) { const k = ease(t / OUT_MS); gx = c.cx * c.D * k; gy = c.cy * c.D * k; op = 1 - 0.7 * k; }
        else if (t >= OUT_MS) { const k = ease((t - OUT_MS) / IN_MS); gx = c.cx * c.D * (1 - k); gy = c.cy * c.D * (1 - k); op = 0.3 + 0.7 * k; }
      }
      let tx = 0, ty = 0;
      if (gathered) {
        const dx = px - c.x, dy = py - c.y;
        if (dx > -R && dx < R && dy > -R && dy < R) {
          const d = Math.hypot(dx, dy);
          if (d < R) { let f = 1 - d / R; f = f * f * 30; tx = c.cx * f; ty = c.cy * f; } // its own heading, not away from the pointer
        }
      }
      c.vx = (c.vx + (tx - c.ox) * 0.09) * 0.8;
      c.vy = (c.vy + (ty - c.oy) * 0.09) * 0.8;
      c.ox += c.vx;
      c.oy += c.vy;
      if (Math.abs(c.vx) + Math.abs(c.vy) + Math.abs(c.ox - tx) + Math.abs(c.oy - ty) > 0.05) busy = true;
      c.el.style.transform = `translate(${(gx + c.ox).toFixed(1)}px,${(gy + c.oy).toFixed(1)}px)`;
      c.el.style.opacity = gathered ? "" : op.toFixed(2);
    }
    if (!gathered) {
      busy = true;
      if (now - t0 > OUT_MS + IN_MS + chars.length * STAGGER + 30) {
        gathered = true;
        for (const c of chars) c.el.style.opacity = "";
        measure();
        resolve();
      }
    }
    if (busy || ptr) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; ptr = [e.clientX, e.clientY]; kick(); };
  const onLeave = () => { ptr = null; kick(); };
  const onTouch = (e: TouchEvent) => { // a tap scatters nearby characters, each its own way
    if (!gathered) return;
    const t = e.touches[0], px = t.clientX, py = t.clientY + scrollY;
    for (const c of chars) {
      const d = Math.hypot(px - c.x, py - c.y);
      if (d < 130) { const f = (1 - d / 130) * 15; c.vx += c.cx * f; c.vy += c.cy * f; }
    }
    kick();
  };
  const onResize = () => { if (gathered) measure(); };

  measure();
  t0 = performance.now() + 250;
  kick();
  if (fine) { area.addEventListener("pointermove", onMove); area.addEventListener("pointerleave", onLeave); }
  area.addEventListener("touchstart", onTouch, { passive: true });
  addEventListener("resize", onResize);

  return {
    gathered: done,
    stop: () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      area.removeEventListener("touchstart", onTouch);
      removeEventListener("resize", onResize);
      heading.removeAttribute("aria-label");
      heading.replaceChildren(...original); // hand React back the nodes it rendered
      resolve();
    },
  };
}
