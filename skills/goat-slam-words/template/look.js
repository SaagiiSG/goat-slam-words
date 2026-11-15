// 08 Slam Words. Reads window.PLAN (look.mjs works out each card's time, background, colours and stretch
// steps) and builds one paused GSAP timeline. One card shows at a time; between cards the footage plays untouched.
const P = window.PLAN;
const tl = gsap.timeline({ paused: true });
const F = 1 / 30;
const at = (t) => Math.max(0, t - 0.001); // frame-exact events land on their frame, not one late
const box = document.getElementById("cards");
const add = (cls, parent, text) => {
  const e = parent.appendChild(document.createElement("div"));
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
// a card at 0 is already in place on frame 0, the thumbnail; later ones arrive on their frame
const show = (target, vars, t) => (t < F ? gsap.set(target, vars) : tl.set(target, vars, at(t)));

const words = [], stacks = [];
P.cards.forEach((c, i) => {
  const next = P.cards[i + 1], ends = c.end < P.dur - 0.01;
  // the background: the card's colour, or the black veil over the footage; it goes at the card's end unless
  // the next card takes over on that same frame
  show("#bg", { backgroundColor: c.back ?? "#000", opacity: c.back ? 1 : c.dim }, c.start);
  if (ends && !(next && Math.round(next.start * 30) === Math.round(c.end * 30))) tl.set("#bg", { opacity: 0 }, at(c.end));

  if (c.kind === "stack") { // one line a beat, its rule drawing across under it in 4 frames
    const el = add("stack", box);
    c.lines.forEach((l, j) => {
      const line = add(l.outline ? "line outline" : "line", el, l.text), t = c.start + j * P.beat;
      if (!l.outline) line.style.color = l.color;
      show(line, { opacity: 1 }, t);
      if (j === c.lines.length - 1) return;
      const rule = add("rule", el);
      rule.style.background = P.accent2;
      if (t < F) gsap.set(rule, { scaleX: 1 });
      else tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 4 * F, ease: "none", immediateRender: false }, at(t));
    });
    show(el, { opacity: 1 }, c.start);
    if (ends) tl.set(el, { opacity: 0 }, at(c.end));
    stacks.push({ el, n: c.lines.length });
    return;
  }

  const el = add(c.outline ? "word outline" : "word", box);
  for (const r of c.rows) add("row", el, r);
  el.style.color = c.outline ? c.clear : c.color;
  if (c.outline) el.style.webkitTextStrokeColor = c.color;
  gsap.set(el, { xPercent: -50, yPercent: -50, force3D: false });
  show(el, { opacity: 1 }, c.start);
  if (c.start >= F) { // the slam: 140% -> 97% -> 100% over three frames, then 3 frames of shake dying out (v1)
    tl.set(el, { scale: 1.4, force3D: false }, at(c.start));
    tl.set(el, { scale: 0.97, force3D: false }, at(c.start + F));
    const r = GOAT.rng(100 + i);
    [9, 6, 3].forEach((a, k) =>
      tl.set(el, { scale: 1, x: (r() * 2 - 1) * a, y: (r() * 2 - 1) * a, force3D: false }, at(c.start + (2 + k) * F)));
    tl.set(el, { x: 0, y: 0, force3D: false }, at(c.start + 5 * F));
  }
  // the stretch: narrow for a beat, then wdth 70 -> 125 frame by frame over the next beat (sizes in layout())
  if (c.steps) c.steps.forEach((w, k) => tl.set(el, { "--w": w }, at(c.start + P.beat + k * F)));
  // the outline fills in two-thirds of the way through the card, over 3 frames (fewer on a card under 0.4 s, so
  // it is whole before the card ends)
  if (c.outline) tl.fromTo(el, { color: c.clear }, { color: c.color, duration: Math.min(3 * F, c.end - c.fillAt - F),
    ease: "none", immediateRender: false }, at(c.fillAt));
  if (ends) tl.set(el, { opacity: 0 }, at(c.end));
  words.push({ el, c });
});

tl.set({}, {}, P.dur);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;

// Sizes need the real font; the renderer waits for document.fonts.ready before the first frame.
// A word's rows are sized together to fill the 840 px safe width, up to 460 px type for one row or 300 px for two
// (so the block stays in the band y 270-840), down to 56 px, where look.mjs's row limits fit. A stretch card is
// fitted at every one of its steps and keeps the smallest size, so it fits 840 px on every frame and its height
// holds while it widens. Stack lines each fill 840 px, up to a size at which all lines end above y 1248.
function layout() {
  for (const { el, c } of words) {
    let size = c.rows.length > 1 ? 300 : 460;
    for (const w of c.steps ?? [70]) {
      el.style.setProperty("--w", w);
      size = GOAT.fit(el, 840, size, 56);
    }
    el.style.setProperty("--w", 70);
  }
  for (const { el, n } of stacks) {
    const cap = Math.min(240, Math.floor((960 - 34 * (n - 1)) / (0.92 * n)));
    for (const line of el.querySelectorAll(".line")) GOAT.fit(line, 840, cap, 42);
  }
}
layout();
document.fonts.ready.then(layout);
