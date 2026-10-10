// The hub's thread (concept A2, docs/superpowers/specs/2026-10-10-imysh-interaction-options.md):
// one terracotta line that starts under the central sentence, runs down the outer left margin,
// crosses 02's top line on the same side, ties a knot at every year and ends in a hook that turns
// back up toward 「いま」. It is drawn as far as the reader has scrolled.
//
// Routing rules: it only ever flows down, uses gentle curves (no corners), and never touches a box
// marked [data-avoid] or [data-path-row]; every S-curve is placed where it fits (see route()).
// Framework-free so it can be tested on its own; HubThread.tsx mounts it.

type Pt = [number, number];
interface Box { l: number; t: number; r: number; b: number }
interface Knot { el: HTMLElement; idx: number; x: number; y: number; sub: boolean; bottom: number; frac: number; leave: number; k: SVGCircleElement }

export interface ThreadOptions {
  root: HTMLElement; // positioned container; the svg is its first child and the coordinate origin
  svg: SVGSVGElement;
  heading: HTMLElement; // the central sentence (the underline starts under it)
  now: HTMLElement; // 01 section
  path: HTMLElement; // 02 section
  reduced: boolean; // static: drawn in full, no listeners besides resize
  waitFor?: Promise<void>; // the thread starts drawing once this resolves (the sentence's gather)
}

const PAD = 6; // clearance kept from every box
const SVGNS = "http://www.w3.org/2000/svg";

export function startThread(o: ThreadOptions): () => void {
  const { root, svg, heading, now, path: pathSec, reduced } = o;
  const th = svg.querySelector<SVGPathElement>(".th")!;
  const ahead = svg.querySelector<SVGPathElement>(".th-ahead")!;
  const knotsG = svg.querySelector<SVGGElement>(".knots")!;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const doc = document.documentElement;

  let P: Pt[] = [], L: number[] = [], MY: number[] = [], O: number[][] = [], total = 1;
  let knots: Knot[] = [], drawn = 0, target = 0, raf = 0, bending = false, started = reduced;
  let ptr: Pt | null = null, rootTop = 0, ulFrac = 0, edgeFrac = 0;
  let OB: Box[] = [], startKnot: SVGCircleElement | null = null, edgeKnot: SVGCircleElement | null = null, endKnot: SVGCircleElement | null = null;
  let seed = 7;
  const srnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const box = (el: Element): Box => {
    const r = el.getBoundingClientRect(), m = root.getBoundingClientRect();
    return { l: r.left - m.left, t: r.top - m.top, r: r.right - m.left, b: r.bottom - m.top };
  };
  const hit = (pts: Pt[]) => pts.some(([x, y]) => OB.some((b) => x > b.l - PAD && x < b.r + PAD && y > b.t - PAD && y < b.b + PAD));
  const bez = (p0: Pt, c1: Pt, c2: Pt, p3: Pt): Pt[] => {
    const len = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) + 1, n = Math.max(6, Math.ceil(len / 5)), out: Pt[] = [];
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      out.push([
        u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
      ]);
    }
    return out;
  };
  const vline = (x: number, y0: number, y1: number, sway: number): Pt[] => {
    const H = y1 - y0, n = Math.max(1, Math.ceil(H / 5)), ph = srnd() * 6.28, out: Pt[] = [];
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      out.push([x + (sway ? Math.sin(Math.PI * t) * Math.sin((t * H) / 280 * 6.28 + ph) * sway : 0), y0 + H * t]);
    }
    return out;
  };
  // A (heading down) → B (arriving from above): straight where it must be, one S-curve where there
  // is room. Tries the longest, gentlest curve first and slides it until nothing is touched.
  const route = (A: Pt, B: Pt, sway: number): Pt[] => {
    const H = B[1] - A[1];
    if (H <= 0) return [B];
    if (Math.abs(A[0] - B[0]) < 0.5) {
      const v = vline(A[0], A[1], B[1], sway);
      return hit(v) ? vline(A[0], A[1], B[1], 0) : v;
    }
    // window lengths: fractions of the run first (gentlest), then short absolute ones for tight gaps
    // (e.g. between a parent row and its first sub-row)
    const lengths = [1, 0.85, 0.7, 0.56, 0.44, 0.34, 0.26, 0.18].map((f) => H * f).concat([72, 60, 50, 42, 36].filter((l) => l < H * 0.18));
    for (const Lh of lengths) {
      for (const p of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
        const ys = A[1] + (H - Lh) * p, ye = ys + Lh;
        const pts = [
          ...(ys > A[1] + 0.5 ? vline(A[0], A[1], ys, 0) : []),
          ...bez([A[0], ys], [A[0], ys + Lh * 0.5], [B[0], ye - Lh * 0.5], [B[0], ye]),
          ...(ye < B[1] - 0.5 ? vline(B[0], ye, B[1], 0) : []),
        ];
        if (!hit(pts)) return pts;
      }
    }
    return bez(A, [A[0], A[1] + H * 0.5], [B[0], B[1] - H * 0.5], B);
  };
  // a loop entered and left at its right-hand point, both times heading straight down: no corner
  const curl = (cx: number, cy: number, r: number): Pt[] => {
    const out: Pt[] = [];
    for (let a = 10; a <= 360; a += 10) out.push([cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r]);
    return out;
  };
  const knot = (x: number, y: number, r: number, cls = "") => {
    const c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("cx", x.toFixed(1));
    c.setAttribute("cy", y.toFixed(1));
    c.setAttribute("r", String(r));
    c.setAttribute("class", `knot ${cls}`.trim());
    knotsG.appendChild(c);
    return c;
  };
  const toD = (withOffsets: boolean) => {
    let s = "M";
    for (let i = 0; i < P.length; i++) {
      const p = P[i], off = withOffsets ? O[i] : null;
      s += (i ? " L" : "") + (off ? p[0] + off[0] : p[0]).toFixed(1) + " " + (off ? p[1] + off[1] : p[1]).toFixed(1);
    }
    return s;
  };

  function build() {
    seed = 7;
    P = [];
    knots = [];
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-path-row]"));
    OB = [...Array.from(root.querySelectorAll("[data-avoid]")), ...rows]
      .filter((el) => el.getClientRects().length > 0) // skip display:none (e.g. the xl column header on phones)
      .map(box);
    const wide = innerWidth >= 768;
    const rootLeft = root.getBoundingClientRect().left;
    const hb = box(heading);
    const contentLeft = now.getBoundingClientRect().left; // page x of the content's left edge
    const gx = Math.max(5, contentLeft - Math.min(40, contentLeft * 0.5)) - rootLeft; // the outer left margin
    const gutterSway = Math.max(0, Math.min(7, contentLeft - rootLeft - PAD - gx - 2, gx + rootLeft - 3));
    // underline, right → left under the sentence, then off into the margin
    const uy = hb.b - 10; // inside the heading's bottom padding
    const ur: Pt = [hb.l + Math.min((hb.r - hb.l) * 0.74, hb.r - hb.l - 12), uy - 3];
    const ul: Pt = [hb.l + 4, uy + 2];
    const w = hb.r - hb.l;
    P.push(ur);
    P.push(...bez(ur, [ur[0] - w * 0.25, uy + 8], [ul[0] + w * 0.25, uy + 6], ul));
    const drops = [72, 58, 46, 36, 28];
    for (let i = 0; i < drops.length; i++) {
      const g0: Pt = [gx, ul[1] + drops[i]];
      const c = bez(ul, [ul[0] - Math.min(26, (ul[0] - gx) * 0.8), ul[1] + 2], [gx, g0[1] - drops[i] * 0.55], g0);
      if (!hit(c) || i === drops.length - 1) {
        P.push(...c);
        break;
      }
    }
    const ulIdx = P.length - 1;
    // down the margin to 02's top line, crossing it on the same side
    const pb = box(pathSec);
    P.push(...route(P[P.length - 1], [gx, pb.t], gutterSway));
    const edgeIdx = P.length - 1;
    const firstRow = rows[0] ? box(rows[0]) : pb;
    const laneX = (firstRow.l + Math.max(gx, box(now).l)) / 2; // midway between content edge and the first card
    let last: Box = pb;
    for (const el of rows) {
      const b = box(el), sub = el.hasAttribute("data-sub");
      const r = sub ? 6 : 10;
      const lx = sub ? b.l - (wide ? 22 : 9) : laneX + r / 2;
      const y = b.t + (sub ? 26 : 34);
      P.push(...route(P[P.length - 1], [lx, y], 8));
      const idx = P.length;
      P.push(...curl(lx - r, y, r));
      knots.push({ el, idx, x: lx - r, y, sub, bottom: b.b, frac: 0, leave: 0, k: null as unknown as SVGCircleElement });
      last = b;
    }
    // ending: down the lane to the closing line of 02 (「そして、いま。」 + the link to 01) and stop there;
    // without one, a hook past the last row that turns back up toward 「いま」
    const endEl = root.querySelector("[data-thread-end]");
    if (endEl) {
      const e = box(endEl);
      P.push(...route(P[P.length - 1], [laneX, e.t + 16], 8));
    } else {
      const hx = P[P.length - 1][0], hookY = last.b + 34, R = 20, cx = hx + R;
      P.push(...route(P[P.length - 1], [hx, hookY], 0));
      for (let a = 170; a >= 0; a -= 10) P.push([cx + Math.cos((a * Math.PI) / 180) * R, hookY + Math.sin((a * Math.PI) / 180) * R]);
      const end = P[P.length - 1];
      P.push(...bez(end, [cx + R, hookY - 8], [cx + R, hookY - 14], [cx + R, hookY - 20]));
    }

    L = [0];
    MY = [P[0][1]];
    for (let k = 1; k < P.length; k++) {
      L[k] = L[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]);
      MY[k] = Math.max(MY[k - 1], P[k][1]);
    }
    total = L[L.length - 1] || 1;
    ulFrac = L[ulIdx] / total;
    edgeFrac = L[edgeIdx] / total;
    O = P.map(() => [0, 0, 0, 0]);
    knotsG.replaceChildren();
    startKnot = knot(ur[0], ur[1], 4, "on");
    edgeKnot = knot(gx, pb.t, 3, "edge");
    for (const n of knots) {
      n.frac = L[n.idx] / total;
      let j = n.idx;
      while (j < P.length - 1 && MY[j] < n.bottom - 36) j++;
      n.leave = L[j] / total;
      n.k = knot(n.x, n.y, n.sub ? 3 : 4.5);
    }
    const e = P[P.length - 1];
    endKnot = knot(e[0], e[1], 4);
    const W = root.clientWidth, H = root.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    const d = toD(false);
    th.setAttribute("d", d);
    ahead.setAttribute("d", d);
    rootTop = root.getBoundingClientRect().top + scrollY;
  }

  function scrollTarget() {
    if (!started) return 0;
    if (scrollY + innerHeight >= doc.scrollHeight - 4) return 1;
    const y = scrollY + innerHeight * 0.62 - rootTop;
    let lo = 0, hi = MY.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (MY[mid] < y) lo = mid + 1;
      else hi = mid;
    }
    return Math.max(ulFrac, L[lo] / total);
  }
  function paint() {
    th.style.strokeDashoffset = (1000 * (1 - drawn)).toFixed(2);
    let here: Knot | null = null;
    for (const n of knots) {
      const lit = drawn >= n.frac - 0.002;
      n.el.classList.toggle("lit", lit);
      n.k.classList.toggle("on", lit);
      n.el.classList.toggle("leaving", drawn >= n.leave);
      if (lit) here = n;
    }
    for (const n of knots) n.el.classList.toggle("here", n === here);
    edgeKnot?.classList.toggle("on", drawn >= edgeFrac);
    endKnot?.classList.toggle("on", drawn > 0.999);
    startKnot?.classList.toggle("on", started);
  }
  function springs() {
    let any = false;
    const R = 110, px = ptr ? ptr[0] : -1e5, py = ptr ? ptr[1] : -1e5;
    for (let i = 0; i < P.length; i++) {
      const off = O[i];
      let tx = 0, ty = 0;
      const dx = px - P[i][0], dy = py - P[i][1];
      if (dx > -R && dx < R && dy > -R && dy < R) {
        const d = Math.hypot(dx, dy);
        if (d < R) {
          let f = 1 - d / R;
          f *= f * 0.32;
          tx = dx * f;
          ty = dy * f;
          const m = Math.hypot(tx, ty);
          if (m > 16) { tx *= 16 / m; ty *= 16 / m; }
        }
      }
      if (tx || ty || off[0] || off[1] || off[2] || off[3]) {
        off[2] = (off[2] + (tx - off[0]) * 0.1) * 0.82;
        off[3] = (off[3] + (ty - off[1]) * 0.1) * 0.82;
        off[0] += off[2];
        off[1] += off[3];
        if (Math.abs(off[0]) + Math.abs(off[1]) + Math.abs(off[2]) + Math.abs(off[3]) < 0.02 && !tx && !ty) off.fill(0);
        else any = true;
      }
    }
    th.setAttribute("d", toD(true));
    if (!any && !ptr) {
      bending = false;
      th.setAttribute("d", toD(false));
    }
    return any || !!ptr;
  }
  function frame() {
    raf = 0;
    let busy = false;
    const diff = target - drawn;
    if (Math.abs(diff) > 0.0004) { drawn += diff * 0.14; busy = true; } else drawn = target;
    if (bending) busy = springs() || busy;
    paint();
    if (busy) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const local = (cx: number, cy: number): Pt => { const m = root.getBoundingClientRect(); return [cx - m.left, cy - m.top]; };

  const onScroll = () => { target = scrollTarget(); kick(); };
  const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; ptr = local(e.clientX, e.clientY); bending = true; kick(); };
  const onLeave = () => { ptr = null; kick(); };
  const onTouch = (e: TouchEvent) => { // pluck the thread: an impulse away from the finger, then it rings out
    const t = e.touches[0], q = local(t.clientX, t.clientY);
    let any = false;
    for (let i = 0; i < P.length; i++) {
      const dx = P[i][0] - q[0], dy = P[i][1] - q[1], d = Math.hypot(dx, dy);
      if (d < 70) { const f = (1 - d / 70) * 9; O[i][2] += (dx / (d || 1)) * f; O[i][3] += (dy / (d || 1)) * f; any = true; }
    }
    if (any) { bending = true; kick(); }
  };

  build();
  if (reduced) {
    svg.classList.add("static");
    drawn = target = 1;
    paint();
  } else {
    doc.classList.add("fx-thread");
    paint();
    addEventListener("scroll", onScroll, { passive: true });
    if (fine) {
      addEventListener("pointermove", onMove, { passive: true });
      doc.addEventListener("pointerleave", onLeave);
    }
    root.addEventListener("touchstart", onTouch, { passive: true });
    (o.waitFor ?? Promise.resolve()).then(() => { started = true; build(); onScroll(); });
  }

  let rt = 0;
  const rebuild = () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      build();
      if (reduced) drawn = target = 1;
      else target = scrollTarget();
      paint();
      if (!reduced) kick();
    }, 120);
  };
  const ro = new ResizeObserver(rebuild);
  ro.observe(root);
  const imgs = Array.from(root.querySelectorAll("img")).filter((im) => !im.complete);
  imgs.forEach((im) => im.addEventListener("load", rebuild));
  document.fonts?.ready.then(rebuild);

  // for automated checks: the thread's points and the boxes it must avoid, in root coordinates
  (window as unknown as { __thread?: () => unknown }).__thread = () => ({ P, OB });

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(rt);
    ro.disconnect();
    imgs.forEach((im) => im.removeEventListener("load", rebuild));
    removeEventListener("scroll", onScroll);
    removeEventListener("pointermove", onMove);
    doc.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("touchstart", onTouch);
    doc.classList.remove("fx-thread");
    knots.forEach((n) => n.el.classList.remove("lit", "leaving", "here"));
    knotsG.replaceChildren();
    th.removeAttribute("d");
    ahead.removeAttribute("d");
    svg.classList.remove("static");
  };
}

// 01 → 02: settle on 02's top line when the reader stops just short of it (or just past it) while
// scrolling down. Never going up, never while a finger is down, once per pass.
export function startSettle(pathSec: HTMLElement): () => void {
  let lastY = scrollY, dir = 0, timer = 0, touching = false, armed = true;
  const settle = () => {
    if (touching) return;
    const top = pathSec.getBoundingClientRect().top, vh = innerHeight;
    if (top > vh * 0.7 || top < -vh * 0.5) armed = true;
    if (!armed || dir <= 0) return;
    if ((top > 2 && top < vh * 0.45) || (top < -2 && top > -vh * 0.12)) {
      armed = false;
      scrollTo({ top: scrollY + top, behavior: "smooth" });
    }
  };
  const onScroll = () => {
    const y = scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    clearTimeout(timer);
    timer = window.setTimeout(settle, 160); // Safari has no scrollend: debounce instead
  };
  const onStart = () => { touching = true; };
  const onEnd = () => { touching = false; clearTimeout(timer); timer = window.setTimeout(settle, 160); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("touchstart", onStart, { passive: true });
  addEventListener("touchend", onEnd, { passive: true });
  return () => {
    clearTimeout(timer);
    removeEventListener("scroll", onScroll);
    removeEventListener("touchstart", onStart);
    removeEventListener("touchend", onEnd);
  };
}
