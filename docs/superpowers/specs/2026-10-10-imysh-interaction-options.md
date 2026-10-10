# imysh hub — interaction options

Date: 2026-10-10
Status: **Round 2** (three whole-page concepts) is waiting for the owner's choice. Round 1 (micro-effects) was rejected by the owner as too plain and is kept below as the baseline. Nothing is implemented.
Source session: dev 오케스트레이션 2026-10-10 (Claude Code, `~/dev` command post), subagent round "plan only"
Base: `redesign` / `main` at `9b4e9ce`. Visual system and a11y floor: [redesign spec §4](2026-10-10-imysh-redesign-design.md#4-visual-system-c3).

Prototypes (local, not in the repo):
- Round 2: `/private/tmp/claude-501/-Users-ysh-dev/e1c0637d-ddc6-410d-8ab4-717c46a878d5/scratchpad/imysh-interaction-r2/index.html`
- Round 1: `/private/tmp/claude-501/-Users-ysh-dev/e1c0637d-ddc6-410d-8ab4-717c46a878d5/scratchpad/imysh-interaction/index.html`

Round 1 pages use the C3 tokens, Zen Maru Gothic, the real ja copy from `content/now.ja.yaml` and
`content/path.ja.yaml`, and placeholder-coloured photo cells. A small panel at the bottom right
explains the option and links to the same page with motion reduced (`?rm=1`), which must look
like today's static hub.

## Round 2 — three whole-page concepts

The owner looked at Round 1 and said 「지금껀 너무 심심하다」 (too plain). Round 2 does not add
effects to the current page. Each concept is one idea that drives all three wishes at once:
settling on 02, the background and cursor, and how a year behaves in 02. Colour stays C3 (warm
ground, one terracotta accent, Zen Maru Gothic). The boldness is in motion and composition.

Prototypes: `scratchpad/imysh-interaction-r2/` (full path at the top of this doc).
- `index.html` lists the concepts and links back to `baseline-round1.html`.
- They use the real ja copy, built from `content/*.ja.yaml` by `scratchpad/imysh-src2/gen2.mjs`.
- They use the live site's processed 640px images, copied from `public/images/` into `img/`.
  The Second Brain graph is the published, pre-blurred one; it was checked visually and its labels
  are unreadable.
- `?rm=1` gives the static version of each page.

### What the three share

- **Settling into 02** uses Round 1's measured 1-B: it acts only when scrolling down, once per
  pass, and never while a finger is down. Each concept then gives the moment its own meaning (A: the
  thread draws 02's top edge, B: the track takes over, C: the deck arrives).
- **The 01 sentence is server-rendered text.** No concept hides it before or during load, so LCP
  stays the same element.
- **Reduced motion, `?rm=1`, or no JS** gives a calm static page. All text is visible, nothing is
  pinned, and no transforms are applied. A keeps its line, drawn in full and still. C keeps its
  paper look.
- **Readers keep the pace.** No scroll hijacking and no smooth-scroll library. Lenis was considered
  and left out, because it takes over native scrolling, which is the opposite of letting the
  reader control the pace.

### A 「一本の線」 — one line (recommended)

**The idea.** One terracotta, hand-drawn thread is the person's path. Spec decision §2.6 already
says the path is *one line, not parallel themes*. Here that line becomes visible and moves with
the reader.

What happens, top to bottom:
- **On arrival** the thread underlines the central sentence and curls once. A small knot marks
  where it starts.
- **Scrolling down 01**, the drawn end of the thread follows the reading line (62% of the
  viewport). It runs behind the 01 cards, so text is never crossed.
- **01 → 02.** The thread draws 02's top edge from right to left; the static border is hidden while
  the script runs. The page settles on that edge.
- **At each year** the thread ties a knot (one and a half turns), and the row appears:
  - the knot pops;
  - the card goes from translucent to white;
  - the year grows from half size to 48/64px and turns terracotta while it is the current row;
  - the photos come in as tilted prints;
  - the thought appears one sentence at a time (each sentence on its own line).
- **"Why I moved on"** appears only when the thread leaves the row (its drawn end passes the
  row's bottom).
- **At 2026 前半** the thread detours through the four sub-project knots (indented) and rejoins.
- **After 2026 後半** it curves back up toward 「→ 01 いま へ」 and ends in a knot. Following that
  link scrolls up, and the thread un-draws: the loop.

Cursor and touch:
- **Cursor:** thread points within 110px lean toward the pointer (spring, max 16px) and settle back
  when it leaves, like a thread.
- **Touch:** tapping near the thread plucks it, so it rings out and settles.
- **Phone:** the thread runs in a 30px lane left of the stacked rows; the design is otherwise the
  same.

Build:
- Vanilla JS, 6.1 KB min / **2.8 KB gz**, plus about 2 KB gz CSS. No library.
- The path is a polyline of about 1,700 (1440px) to 2,200 (390px) points with `pathLength="1000"`. It is rebuilt from DOM
  positions on resize, image load and `document.fonts.ready`.
- A monotone "deepest y so far" table maps scroll to drawn length.
- Row states are classes (`lit`, `leaving`, `here`) and use only opacity and transform, so there is
  no layout shift.
- `:focus-within` shows a row at once for keyboard users.

Risks:
- Geometry must be rebuilt whenever layout changes. Lazy images, font swap and the ko locale's
  different line lengths are all handled by rebuild triggers.
- Rows below the reading line are faint until reached. That is deliberate. Under reduced motion
  everything is shown.
- Brief pins were not built. Pinning would move rows away from where the thread expects them and
  add dead scroll; the knot-and-reveal moment stands in for the pin. Of the three, this concept has
  the most code to own.

### B 「それぞれの方向」 — each their own direction

**The idea.** "Each person, their own value", taken literally: every character of the central
sentence and every point behind it has its own heading.

01:
- After the text has painted, the script splits the h1 into characters. A visually hidden copy
  keeps the sentence whole for screen readers, and punctuation is glued to the previous character
  so no line starts with 。.
- On load the characters take one breath out along their headings and come back.
- **Cursor:** nearby characters drift along *their own* heading (not away from the pointer) and
  spring back.
- **Tap:** nearby characters scatter and return.
- **Scrolling past 01:** the whole sentence comes apart, each character its own way, and the
  background points speed up. Scrolling back reassembles it.

02:
- **Desktop (≥1100×700):** 02 pins and becomes a horizontal track of five year cards.
  - The card nearest the centre scales up to full size; the others sit at 86%.
  - Two photo layers move at different speeds (parallax).
  - A huge pale year numeral slides behind each card.
  - When scrolling stops, the track settles on the nearest card. GSAP snap uses `inertia: false`:
    with inertia on, it jumped a whole card ahead, 2036 → 3423px.
  - Sub-projects are tiles inside their year card.
  - If any card's content would be clipped at the current window size, the page falls back to
    vertical.
  - Tab focus moves the track to the focused card.
- **Phone:** vertical cards that grow toward the centre, with photo parallax and the numeral
  drifting behind.

Build:
- GSAP core + ScrollTrigger: 28.2 + 17.8 = **46 KB gz** (jsDelivr in the prototype; `npm i gsap`,
  free for all use since the Webflow acquisition — confirmed on gsap.com/pricing).
- Own code: 7.4 KB min / 3.1 KB gz. SplitText was not needed (a manual split is about 0.3 KB).

Risks:
- The pinned track is about 4,400px of scroll at 1440×900, nearly twice the 2,300px of vertical 02
  at that size. It is still a pin. Several measures keep it from trapping the reader: snap, keyboard follow, the clip check, and
  the vertical fallback.
- 46 KB of library on a page that is 91–92 on Lighthouse mobile today. It can be loaded after the
  first idle period, but **≥90 is not certain** and has to be measured.
- Kinetic type and a moving field at once is the busiest of the three.

### C 「索引カード」 — index cards

**The idea.** C3's "soft index", made physical: a desk, paper, and a lamp.

The look:
- A paper-grain texture (inline SVG noise) on the ground and on every card.
- Cards with a terracotta header rule.
- Photos as taped prints.
- 01's thinking note on a ruled card; the portrait is a taped print.

02 is a deck:
- Each year is an index card whose tab sits at its own position, like real file dividers.
- Scrolling brings the next card in tilted (±3°) and 40px low, then lays it flat as it reaches the
  top. It covers the previous card, which shrinks slightly and darkens 6%.
- Passed cards stay stacked behind, with **only their staggered year tabs showing**.
- A card taller than the screen (2023 and 2026 前半 on a phone) scrolls through completely first and
  stacks only once its bottom is in view. The sticky top is computed per card, so nothing is ever
  covered unread.
- The tabs are dealt in one by one when 02 arrives (the settle).

Cursor and touch:
- **Cursor:** a desk lamp. The warm light follows the pointer, and every paper's shadow falls
  away from it (longer when farther away).
- **Desktop:** prints can be dragged a little (±70×50px) and stay where they are put.
- **Touch:** a tap moves the lamp to the finger for 2 s, and tapping a print lifts it.

Keyboard:
- While focus is visibly inside the deck, CSS (`:has(:focus-visible)`) turns the stack back into a
  plain column.
- The first test found that every focused link in a covered card was hidden. After this change,
  all 14 were visible.

Build:
- Vanilla JS, 3.9 KB min / **1.5 KB gz**, plus 2.6 KB gz CSS. No library. Uses CSS sticky only.

Risks:
- The metaphor fits "index" and "C3" better than the central sentence.
- On a phone, the tall cards stack less visibly than on desktop.
- The grain must stay subtle, or the page reads as "craft template".

### Comparison

| | A 一本の線 | B それぞれの方向 | C 索引カード |
|---|---|---|---|
| Fit to the sentence / spec | **Strongest**: the path as one line (§2.6), loop back to いま (§3.1) | Strong for 01 (each their own direction); 02 track is generic | Fits C3's "index"; weak link to the sentence |
| Snap meaning | thread draws 02's edge, page settles on it | track takes over | deck arrives, tabs dealt |
| Cursor / touch | thread bends / pluck | letters and points drift their own way / tap scatter | lamp and shadows, drag prints / tap lamp, lift print |
| Phone | same concept in a 30px lane | vertical cards + scatter | deck with per-card sticky tops |
| Added JS (gz) | 2.8 KB | 46 KB + 3.1 KB | 1.5 KB |
| Lighthouse mobile ≥90 | likely | **uncertain**; must measure | likely |
| Main risk | geometry rebuilds; most own code | pinned length, library weight, busy | metaphor weaker; grain taste |

Measured on the prototypes (Chrome, Playwright):
- **Errors and overflow:** no console errors and no horizontal scroll at 390×844 and 1440×900,
  both with motion on and with `?rm=1`.
- **Settle into 02** (all three, both sizes):
  - stop going down with 02's top at 150px → settles at 0;
  - stop at 500px → stays;
  - going up → never pulled.
- **Keyboard:** Tab through 02 at both sizes. All 14 focused links in each concept end up in view,
  on top and fully opaque. This took two fixes:
  - C's `:has(:focus-visible)` column;
  - A's fast transition under `:focus-within`.
- **Load and scroll cost** (390×844, 4× CPU throttle, file://):
  - load blocking is about 63 / 78 / 69 ms for A / B / C, against 38 ms for the Round 1 baseline;
  - scrolling frames stay at 16.7 ms (p50 and p95), with no long tasks.
  - This is not Lighthouse. The real numbers come from the build and the preview.
- Visual sequences of 4–5 screenshots per concept and size are in `scratchpad/shots2/`.

Reference sites the command post listed were opened (HTTP 200, titles match; the effects
themselves were not reviewed in depth):
- brand.ivress.co.jp (イヴレス「SPIN A TALE」);
- ponpon-mania.com;
- why.zero.university;
- lydiaamaruch.com, andregs.com, jonvieira.com;
- sirup.online/5th;
- muuuuu.org/category/interaction;
- tha.jp.

### Recommendation: A, optionally borrowing C's paper

A turns the site's own structural decision (one line of thought, closing back on いま) into the
interaction. So the motion means something rather than decorating. It is also the lightest of the
two bold options, and the phone version is the same idea, not a degraded one.

C's taped prints and paper grain can be layered onto A cheaply: about 1 KB, no new behaviour. Do
that only if the owner wants more texture. B is the most spectacular, but it is also the heaviest
and the hardest to keep at ≥90.

### Implementation sketch (A, for when the owner picks it)

- New client component `components/home/Thread.tsx` (`"use client"`). It renders the `<svg>` and
  holds the `a.js` logic in effects:
  - it measures `#now-heading` and `[data-path-row]` elements;
  - it rebuilds on ResizeObserver, image `load` and `document.fonts.ready`;
  - it cleans up all listeners.
- Other files:
  - `app/[locale]/page.tsx`: wrap the hub in a `relative` container and mount `Thread`.
  - `PathTable.tsx` (still a server component):
    - add `data-path-row` and a left lane;
    - split `thought` into sentence spans at render time;
    - mark the year, photos and "why I moved on" with classes for the states.
  - `NowSection.tsx`: give the h1 bottom room for the underline.
  - `globals.css`: state rules under `.fx-thread` (added by the component, never in SSR HTML) and
    under `prefers-reduced-motion: no-preference`.
- Also `HubMotion.tsx` for the 02 settle, Round 1's 1-B: 0.35 KB gz.
- Size: about 450 lines; JS about 3.2 KB gz in total. No dependencies.
- Verification, as Round 1's plan, plus:
  - thread geometry at 390, 768, 1024, 1280 and 1440, in ja and ko;
  - after a font swap;
  - with a `#path-2024` deep link (thread drawn to that row on arrival);
  - Lighthouse mobile ≥ 90 and CLS 0 on `/ja` and `/ko`, locally and on the preview;
  - iPhone Safari check by the owner: pluck feel, settle, thread under momentum.

### Questions for the owner (Round 2)

1. Which concept: A (recommended), B or C? Or a mix (e.g. A + C's paper and taped prints)?
2. A: is it acceptable that rows below the reading line stay faint until the thread reaches them?
3. B only: is a pinned horizontal track on desktop acceptable, given the ≥90 risk?
4. Should the thread or field also appear on project detail pages, or stay on the hub?


## Round 1 — micro-effects (rejected baseline)

**Owner's verdict (2026-10-10): 「지금껀 너무 심심하다」 (too plain).** Every option was a small effect bolted onto the current page, so restraint itself was the problem. The measurements and the a11y and performance rules below still apply to Round 2. The recommended set is copied into the Round 2 folder as `baseline-round1.html` for comparison.

### The owner's three wishes

1. Scrolling (wheel, trackpad, touch) from 01 いま down to 02 ここまで settles exactly on 02's
   top line.
2. An interactive background that fits the central sentence
   「誰もが、自分が本当に望む価値のために生きられるように。それを手伝いたいです。」, with an effect
   under the mouse cursor.
3. In 02, each year row grows or opens its details as you scroll to it.

### Shared constraints (how every option was judged)

| Check | Rule |
|---|---|
| Tone | C3: warm neutral ground, one terracotta accent (`accent` #E9B8A6 for marks, `accent-text` #B44A30 for text), rounded gothic, soft shadows. No multi-hue pastel, no heavy rules. |
| Phones | No cursor, iPhone Safari first. The table/stack breakpoint is 1280px. 02 is long (about 4,800px at 390px wide, 2,300px at 1440px, measured in the prototype); nothing may trap or fight the reader. |
| Reduced motion | Under `prefers-reduced-motion: reduce` every option is off and the page is exactly today's hub. Without JS, the same. |
| Keyboard / SR | Content is never hidden behind hover. Folded content stays in the DOM and the accessibility tree; focus opens it. No text dims below 4.5:1. |
| Performance | Lighthouse mobile today: 91–92 on `/ja`. No libraries; CSS scroll snap, scroll-driven animations, IntersectionObserver, one small canvas at most. Sizes below are esbuild-minified / gzip. |
| Honesty | The background must say the sentence, not decorate it. |

### Wish 1 — settle on 02's top line

#### Options

| | How | Size | Fits | Problems |
|---|---|---|---|---|
| **1-A** CSS proximity | `html { scroll-snap-type: y proximity }`, `#path { scroll-snap-align: start }`. One snap point only. | 0 JS, ~80 B CSS | Native, blends with momentum, no JS. | **Also pulls when scrolling up.** Measured in Chrome (1440×900): scrolling up from 02 and stopping with 02's top 150 or 300px below the viewport top snaps back down to 02. Someone going back to re-read 01's bottom (one-liners, contact icons) gets pulled away. The proximity distance is chosen by the browser and cannot be tuned; Safari's differs from Chrome's. |
| **1-B** JS settle after scroll stops (recommended) | Debounced scroll listener (160ms, works as a `scrollend` fallback; Safari has no `scrollend`). Settles with `scrollTo({behavior:"smooth"})` only if: the last movement was **downward**; 02's top is in the upper 45% of the viewport (or overshot by ≤12%); no finger is down; and it has not already settled on this pass. It re-arms only after the reader leaves the zone. | ~0.6 KB min / 0.35 KB gz | Exactly the wish: "from 01 to 02". Never acts going up or while reading inside 02. | A second, short programmatic movement after the stop (feels like a gentle nudge, not a native snap). Any user input cancels it (browser default). |
| 1-C `mandatory` / full-page sections | 01 and 02 as snap pages. | 0 JS | — | **Rejected.** 02 is far taller than the viewport; mandatory snapping on oversized areas has a history of trapping or jumping in Safari, and it fights the reader by design. |

Measured with the prototypes (Chrome, real wheel input, 1440×900 and 390×844):

| Case | 1-A | 1-B |
|---|---|---|
| Down, stop with 02 top at 120px / 250px | → 0 / → 0 | → 0 / → 0 |
| Down, stop at 450px (half the screen) | stays | stays |
| Up, stop at 150px / 300px | → 0 / → 0 (pulls) | stays / stays |
| Load `#path-2024` (detail page "this period" link), then wheel 300px | lands at its row, no jump | same |
| `#path-2023`, `-2023-a`, `-2023-b` | land on their rows | same |

A `.row:target { scroll-snap-align: start }` safeguard was tried for 1-A and dropped: it was not
needed (fragment links were never pulled up), and on the 390px layout it caused an extra 84px jump
on the next wheel.

#### Recommendation: 1-B

It is the only option that settles going down and never interferes going up. It costs 0.35 KB
gzipped and needs no library. 1-A is the fallback if the owner prefers the native feel and does
not mind the pull going up.

#### Implementation sketch (1-B)

- New `components/home/HubMotion.tsx` (`"use client"`, renders `null`), mounted once at the end
  of `app/[locale]/page.tsx`. One `useEffect` holds the settle logic from the prototype
  (`imysh-interaction/1b-snap-js.html`). It reads `#path` by id; no props.
- Gate: return early if `matchMedia("(prefers-reduced-motion: reduce)").matches`. Listen to the
  query's `change` event so turning the setting on mid-visit removes the listeners.
- `#path` keeps `scroll-mt-4`. The settle target is `#path`'s border-top line (the "top line"),
  at 0px offset. The nav is not sticky, so no offset is needed.
- No CSS changes. `html { scroll-behavior: smooth }` already exists under `no-preference`.

### Wish 2 — a background that says the sentence

The sentence has three parts: *each person* (誰もが), *their own value* (自分が本当に望む価値), and
*I help* (手伝いたい). An honest picture of it: many small, distinct points, each with **its own
direction**; the helper's presence makes them move **their own way**, never toward the helper. A
picture where points gather at the cursor, flock, or follow it would say the opposite ("come my
way"), so none of the options does that.

#### Options

| | What you see | Cursor / touch | Idle cost | Size |
|---|---|---|---|---|
| **2-C 「一歩」 one step** (recommended) | A still field of small dots behind 01 (about 1 per 9,000 px², 40–150 dots; ~86% muted brown at 38% alpha, ~14% `accent`). Each dot has its own heading. | Near the cursor (radius 90px), dots take **one step their own way** and leave a thin `accent` trace that fades in ~2.6s, plus a soft `accent-tint` light under the cursor. On touch, the dots near where the finger lands step (no light). Every 2.2s one random dot steps on its own. | **Zero**: the frame loop runs only while a step or trace is fading, and stops when 01 is off screen. | 2.9 KB min / 1.5 KB gz |
| 2-A 「それぞれの方向」 drift | The same dots, always drifting slowly (3–8 px/s) along their own heading. | Near the cursor or finger they speed up along their own heading (×6), warm to `accent` and show a short tail, then slow down. Soft light under the cursor. | A constant 60fps loop while 01 is visible (paused off screen and in hidden tabs). | 2.4 KB min / 1.3 KB gz |
| 2-B 「灯り」 light (minimal) | Nothing at rest. | A 240px soft `accent-tint` glow follows the cursor. Phones: nothing. | Zero. | 0.5 KB min / 0.3 KB gz + 1 CSS rule |

Trade-offs:

- **2-C** says the sentence most directly ("helping" = your presence lets each one take their own
  next step) and is the calmest: the headline reads first, and the field only answers when
  approached. On a phone it is mostly still dots with an occasional step, which is honest for a
  device without a cursor. Risk: a visitor may not notice the interaction at all; the occasional
  self-step is the hint.
- **2-A** feels the most alive, but constant motion behind a 68px headline competes with the
  sentence, and it costs battery on phones. It also reads more like a generic particle background.
- **2-B** is the safest and cheapest, but it carries no meaning beyond "warmth", and phone
  visitors (most of the audience) see nothing.

Common rules for 2-A and 2-C:

- Only behind 01, full-bleed, fading out over the last 20% (`mask-image`), so 02 stays plain for
  reading.
- `aria-hidden`, `pointer-events: none`; listeners on `#now`, passive touch listeners only, so
  scrolling is never blocked.
- The canvas is never an LCP candidate (LCP stays the portrait or the h1). Text sits above it in
  z-order and keeps its contrast; the dots are 1.3–3px and never under-paint a glyph.
- Device pixel ratio capped at 2; re-seeded on resize (ResizeObserver, debounced 150ms).
- **Reduced motion or no JS: no canvas is drawn at all.** The page is exactly today's hub.

#### Recommendation: 2-C

#### Implementation sketch (2-C)

- `components/home/StepField.tsx` (`"use client"`): renders
  `<div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[calc(50%-50vw)] w-screen ..."><canvas/></div>`
  as the first child of the 01 `<section>`; the section becomes `relative`, its other children get
  `relative z-[1]` (one wrapper div).
- The drawing code is the prototype's `bg-c.js` as a `useEffect`, returning a cleanup that
  disconnects the observers, clears the interval and cancels the frame.
- Start after the first idle period (`requestIdleCallback`, fallback `setTimeout(…, 300)`), so
  hydration and LCP are untouched.
- Colours come from the tokens via `getComputedStyle(document.documentElement)` (`--color-accent`,
  `--color-accent-tint`, a muted dot colour derived from `--color-text-muted` at 38% alpha), so
  there are no new hex values in components.
- `globals.css`: `html { overflow-x: clip }` (the full-bleed layer must not create a sideways
  scroll; checked at 390px in the prototypes).

### Wish 3 — rows grow or open as you reach them

#### Options

| | What happens | Layout shift | Size | Support |
|---|---|---|---|---|
| **3-A focus lift** (recommended) | The row whose centre is nearest the reading line (a band at 30–60% of the viewport) lifts: `shadow-card-hover`, `translateY(-2px)`; its year grows `scale(1.25)` and turns `accent-text`. A sub-row shows a small `accent` dot to its left and a bold label. The "now" row keeps its ring. | **None** (transform and shadow only) | 0.65 KB min / 0.43 KB gz JS + ~0.6 KB CSS | IntersectionObserver: every target browser |
| 3-A′ same, CSS only | The same look, driven by `animation-timeline: view()` (continuous with scroll, no JS). | None | ~0.5 KB CSS | Chrome/Edge 115+, Safari 26+. Firefox (flag only) and older Safari get today's static rows via `@supports`. |
| 3-B reveal once | Below 1280px only: photos, the thought's note and the "why I moved on" line start folded and open when the row reaches 65% of the viewport, then stay open. At ≥1280px (table) everything shows, as today. | **Yes**: each opening pushes the rows below it down while they are on screen. This is scroll-triggered, so real-user CLS counts it (lab Lighthouse does not scroll and will not show it). | 0.3 KB JS + ~0.6 KB CSS | everywhere |

Trade-offs:

- **3-A** gives the "this year is the one you are reading" feeling without moving any text. Nothing
  is dimmed (dimming would drop text below 4.5:1). Year labels at 1280px+ grow inside their 110px
  column without touching the next column.
- **3-A′** is smoother and JS-free, but only half of the phone audience on older iOS would see it,
  and its focus is tied to scroll position rather than to one row (two rows can be half-lit). It
  can replace 3-A later when Firefox ships it, or be layered as progressive enhancement.
- **3-B** matches "expands the details" literally, but it (a) moves text under the reader, (b)
  hides the "why I moved on" line, which spec §2.6 calls the line that makes the connection
  visible, until the row is reached, and (c) cannot apply to the table layout, where the columns
  would sit empty. Folded content stays readable for screen readers (height 0 + opacity 0, never
  `display: none`) and `:focus-within` opens it, so it is accessible. It is still the weaker
  choice.

#### Recommendation: 3-A (IntersectionObserver)

#### Implementation sketch (3-A)

- `PathTable.tsx` stays a server component. Add `data-path-row` to the top-level row `<div>` and
  each sub-row `<li>` (both already have `id="path-…"`), and a `path-year` class on `YearLabel`'s
  `<p>`.
- `HubMotion.tsx` (the same client component as 1-B) observes `[data-path-row]` with
  `rootMargin: "-30% 0px -40% 0px"` and toggles `data-active` on the single nearest row.
- `globals.css`, inside `@media (prefers-reduced-motion: no-preference)`:
  `[data-path-row]` transitions `box-shadow` and `transform` (0.4s);
  `[data-path-row][data-active]` gets `--shadow-card-hover` and `translateY(-2px)`;
  `[data-active] .path-year` gets `scale(1.25)` and `--color-accent-text`;
  sub-row `::before` dot. The "now" row combines its ring with the shadow (`ring-2` is a
  box-shadow: write the active shadow as `0 0 0 2px var(--color-accent), var(--shadow-card-hover)`
  for it, otherwise the ring disappears; the prototype hit this in 3-A′).
- No markup changes for screen readers: nothing is added, hidden or reordered.

### Recommended set and total cost

1-B + 2-C + 3-A, shown together in `imysh-interaction/0-combined.html`.

| Piece | JS (min / gz) | CSS |
|---|---|---|
| 1-B settle | 0.6 / 0.35 KB | — |
| 2-C one step | 2.9 / 1.5 KB | ~0.2 KB |
| 3-A focus | 0.65 / 0.43 KB | ~0.6 KB |
| **Total** | **≈4.2 / ≈2.3 KB** | **≈0.8 KB** |

React is already on the page (`LanguageSwitcher` is a client component), so the cost is these
bytes plus two small client component boundaries. No dependencies are added.

Files touched when implemented: `components/home/HubMotion.tsx` (new: 1-B + 3-A),
`components/home/StepField.tsx` (new: 2-C), `components/home/NowSection.tsx` (mount the field,
z-order wrapper), `components/home/PathTable.tsx` (data attributes, class), `app/[locale]/page.tsx`
(mount `HubMotion`), `app/globals.css` (focus rules, `overflow-x: clip`). No content, message or
schema changes. Rough size of the change: about 250 lines.

### Verification plan (for the implementation round)

1. `npm run lint`, `npm run typecheck`, `npm run build`, `npm run check:meta`.
2. Lighthouse 13.5 mobile and desktop on `out/` for `/ja` and `/ko`, two runs each, the same
   setup as Phase 4. Target: mobile Performance ≥ 90 (today 91–92), Accessibility 100, CLS 0,
   TBT within +20ms of today. Then again on the Cloudflare preview.
3. Reduced motion: Chrome DevTools → Rendering → `prefers-reduced-motion: reduce`, and iPhone
   (Settings → Accessibility → Motion → Reduce Motion). Expect no canvas, no settle, no focus
   lift; the page should match a screenshot of today's `/ja`.
4. Behaviour (Playwright script like the one used for the prototypes, Chrome and WebKit): down-stop
   at 120/250px → 0; down-stop at 50% → stays; up-stops → stay; `#path-2023`, `#path-2024`,
   `#path-2026-a` from a detail page land on their row; wheel inside 02 → no jump; no horizontal
   scroll at 390px.
5. Keyboard: Tab through 01 and 02; focus ring visible; no focus target hidden or moved by the
   effects. VoiceOver (iOS) reads 01 and 02 in order; the canvas is not announced.
6. Owner on a real iPhone (Safari): momentum scroll from 01 into 02 settles once without a
   double bounce; tapping in 01 makes the dots step; long 02 reads without any pull.

### Browser support notes

- CSS scroll snap: everywhere. `scrollend`: not in Safari, hence the debounce in 1-B.
- Scroll-driven animations (`animation-timeline: view()`): Chrome/Edge 115+, Safari 26+, Firefox
  behind a flag. Only used by 3-A′, always behind `@supports`.
- Canvas 2D, IntersectionObserver, ResizeObserver, `matchMedia("(hover: hover) and (pointer: fine)")`:
  everywhere.
- Prototypes were checked in Chrome at 390×844 and 1440×900 (no console errors, no horizontal
  scroll). WebKit was not run locally (no Playwright WebKit build installed); iPhone Safari is part
  of the owner check above.

### Questions for the owner

1. Wish 1: 1-B (settles only going down; recommended) or 1-A (native CSS; also pulls when going up)?
2. Wish 2: 2-C one step (recommended), 2-A drift, 2-B light, or none?
3. Wish 3: 3-A focus lift (recommended), 3-A′ CSS-only, or 3-B fold-and-open on phones?
4. Should the background extend behind 02 too (lower density), or stay behind 01 only (recommended)?
