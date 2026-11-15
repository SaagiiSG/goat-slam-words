// 08 Slam Words: one to three giant Science Gothic words at a time slam in (140% -> 97% -> 100%, then a short
// shake) over the brand colour, black, white or the footage dimmed to 45%. A word can stretch from narrow to wide
// or start as an outline and fill in; a stack card lands 3-5 lines one per beat with rules drawing across.
// Between cards the footage plays untouched. With no clips, prep makes a black video as long as the cards.
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { missing } from "./scripts/fonts.mjs";

export const NAME = "slam-words";
export const TALKS = false;

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const FONT = "ScienceGothic[CTRS,slnt,wdth,wght].ttf";
const BGS = ["accent", "black", "white", "footage"], CYCLE = ["accent", "black", "footage"]; // v1's default turn
const NARROW = 70, WIDE = 125; // the wdth axis: under 70 at weight 900 the holes in Ө close up (v1)
// Row limits. Every row is sized to fill 840 px down to a floor; these counts fit at the floor even when every
// character is the widest one a Mongolian keyboard types (Ж, 1.214 em at wdth 70; Ю, 1.611 em at wdth 125;
// HarfBuzz advances of Science Gothic at weight 900, kerning adds under 0.05 em a row):
// a word row 12 x 1.214 x 56 px = 816 px, a stretch row at its wide end 9 x 1.611 x 56 = 812, a stack line
// 16 x 1.214 x 42 = 816. Rare symbols wider than Ж (‰ ₧ and a few ligature letters such as Ǌ) can still run past.
const ROW = 12, STRETCH_ROW = 9, LINE = 16, ROWS = 2;
const MIN = 10; // frames: no card or gap between cards under 1/3 s, so the screen changes at most 3 times a second
const DIM = 0.55; // a black veil at 55% leaves the footage 45% of its light (v1)

const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const COLOUR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const rgb = (hex) => {
  const h = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join("") : hex.slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const full = (hex) => "#" + rgb(hex).map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
const light = (hex) => { const [r, g, b] = rgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b > 140; }; // v1
const name = (t) => `"${String(t.text ?? "").trim().replace(/\s*\n\s*/g, " / ")}"`;
const secs = (f) => (f / 30).toFixed(2);

function rows(t) {
  const r = String(t.text ?? "").split("\n").map((x) => x.trim());
  if (!r.join("")) throw new Error(`a "${t.role}" text is empty`);
  if (r.some((x) => !x)) throw new Error(`${JSON.stringify(String(t.text))} has an empty row: remove the extra \\n`);
  return r;
}

export function validate(plan) {
  const lk = plan.look ?? {};
  for (const k of ["accent", "accent2"])
    if (lk[k] !== undefined && !(typeof lk[k] === "string" && COLOUR.test(lk[k])))
      throw new Error(`look "${k}" must be a colour like "#FFE800"`);
  if (lk.bpm !== undefined && !(isNum(lk.bpm) && lk.bpm >= 60 && lk.bpm <= 200))
    throw new Error('look "bpm" must be a number from 60 to 200');
  const texts = plan.texts ?? [];
  for (const t of texts) {
    if (t.role !== "word" && t.role !== "stack") throw new Error(`text role "${t.role}" is not used by this look: use "word" or "stack"`);
    const r = rows(t);
    if (t.start !== undefined && !(isNum(t.start) && t.start >= 0)) throw new Error(`${name(t)}: "start" must be seconds, 0 or more`);
    if (t.end !== undefined && !(isNum(t.end) && t.end > (t.start ?? 0))) throw new Error(`${name(t)} must end after it starts`);
    if (t.role === "stack") {
      for (const k of ["bg", "style", "stretch", "emphasis"])
        if (t[k] !== undefined) throw new Error(`${name(t)}: a stack takes no "${k}" (it is always on black)`);
      if (r.length < 3 || r.length > 5) throw new Error(`stack ${name(t)} has ${r.length} lines: a stack takes 3 to 5, split with \\n`);
      for (const x of r)
        if ([...x].length > LINE) throw new Error(`"${x}" is too long for a stack line (${LINE} characters at most): shorten it`);
    } else {
      if (t.bg !== undefined && !BGS.includes(t.bg)) throw new Error(`${name(t)}: bg must be one of ${BGS.join(", ")}`);
      if (t.style !== undefined && t.style !== "fill" && t.style !== "outline") throw new Error(`${name(t)}: style must be "fill" or "outline"`);
      for (const k of ["emphasis", "stretch"])
        if (t[k] !== undefined && typeof t[k] !== "boolean") throw new Error(`${name(t)}: "${k}" must be true or false`);
      if (r.length > ROWS) throw new Error(`${name(t)} has ${r.length} rows: a word takes ${ROWS} rows at most`);
      const max = t.stretch ? STRETCH_ROW : ROW;
      for (const x of r)
        if ([...x].length > max)
          throw new Error(`"${x}" is too long for one row${t.stretch ? " of a stretch card" : ""} (${max} characters at most): ` +
            "shorten it, or split it into 2 rows with \\n");
    }
    const bad = missing(r.join(" "), join(SKILL_DIR, "fonts", FONT));
    if (bad.length) throw new Error(`${name(t)} uses ${bad.join(" ")}, which Science Gothic can't draw`);
  }
  if (!plan.clips?.length) {
    if (!texts.length) throw new Error("the plan has no clips and no cards: add the words, or the clips");
    const order = [...texts].sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
    if ((order[0].start ?? 0) !== 0)
      throw new Error("with no clips, the first card must start at 0: the first frame is the thumbnail, not empty black");
    if (order.at(-1).end === undefined)
      throw new Error(`with no clips, the last card (${name(order.at(-1))}) needs an "end": the video ends there`);
  }
  timeline(texts, lk, Infinity);
}

// No clips: a black video as long as the cards.
export function BLANK(plan) {
  validate(plan);
  return { dur: [...plan.texts].sort((a, b) => (a.start ?? 0) - (b.start ?? 0)).at(-1).end, color: "black" };
}

// The wdth of each frame of a stretch: 70 to 125 over one beat, eased in and out (v1's ease).
export function stretchSteps(beat) {
  if (!(isNum(beat) && beat > 0)) throw new Error("the beat must be seconds, more than 0");
  const n = Math.max(1, Math.round(beat * 30));
  return Array.from({ length: n + 1 }, (_, k) => Math.round((NARROW + (WIDE - NARROW) * (0.5 - 0.5 * Math.cos((Math.PI * k) / n))) * 100) / 100);
}

// The cards in time order: each ends at its "end", the next card's start or the video's end, whichever is first;
// its background, colours and fill-in time. Times are rounded to whole frames, the frames the template shows them
// on, so the checks count what is on screen. Throws on any timing that would flash or cut a card short.
// dur is Infinity before prep (validate), when the last card's end is not known yet.
export function timeline(texts, look = {}, dur = Infinity) {
  const bpm = look.bpm ?? 150;
  if (!(isNum(bpm) && bpm > 0)) throw new Error('look "bpm" must be a number from 60 to 200');
  if (!(dur === Infinity || isNum(dur))) throw new Error("the video's length must be seconds");
  const frame = (t) => (t === Infinity ? t : Math.round(t * 30) / 30);
  const beat = 60 / bpm, beats = (n) => Math.round(n * beat * 30);
  const accent = full(look.accent ?? "#FFE800"), accent2 = full(look.accent2 ?? "#FF3B30");
  const COLOURS = { // bg -> [background, words]; footage has no background, a 55% black veil instead
    accent: [accent, light(accent) ? "#000000" : "#FFFFFF"],
    black: ["#000000", light(accent) ? accent : "#FFFFFF"],
    white: ["#FFFFFF", "#000000"],
    footage: [null, "#FFFFFF"],
  };
  const list = texts.map((t, i) => ({ t, i, start: t.start ?? 0 })).sort((a, b) => a.start - b.start || a.i - b.i);
  let w = 0;
  const cards = list.map(({ t, start }, k) => {
    if (!isNum(start)) throw new Error(`${name(t)}: "start" must be seconds, 0 or more`);
    if (t.end !== undefined && !isNum(t.end)) throw new Error(`${name(t)}: "end" must be seconds`);
    if (start >= dur) throw new Error(`${name(t)} starts at ${start.toFixed(2)} s, after the video ends (${dur.toFixed(2)} s)`);
    const end = frame(Math.min(t.end ?? Infinity, list[k + 1]?.start ?? Infinity, dur));
    start = frame(start);
    const r = String(t.text).split("\n").map((x) => x.trim());
    if (t.role === "stack")
      return { kind: "stack", t, rows: r, start, end, bg: "black", back: "#000000", dim: 0,
        lines: r.map((text, j) => ({ text, color: j % 3 === 2 ? accent2 : "#FFFFFF", outline: j % 3 === 1 })) };
    const bg = t.bg ?? CYCLE[w % CYCLE.length];
    w++;
    const [back, color] = COLOURS[bg], outline = t.style === "outline";
    return { kind: "word", t, rows: r, start, end, bg, back, color, dim: bg === "footage" ? DIM : 0,
      emphasis: t.emphasis === true, stretch: t.stretch === true, outline,
      ...(outline ? { clear: `rgba(${rgb(color).join(",")},0)`, fillAt: frame(start + ((end - start) * 2) / 3) } : {}) };
  });
  for (const [k, c] of cards.entries()) {
    const s = Math.round(c.start * 30), e = Math.round(c.end * 30), next = cards[k + 1];
    if (e === Infinity) continue; // the last card runs to the video's end, not known yet
    if (e - s < MIN)
      throw new Error(`${name(c.t)} shows for ${secs(e - s)} s: a card needs at least 1/3 s (10 frames), so the screen ` +
        "never changes more than 3 times a second. Give it more time, or leave it out");
    if (next && Math.round(next.start * 30) - e > 0 && Math.round(next.start * 30) - e < MIN)
      throw new Error(`only ${secs(Math.round(next.start * 30) - e)} s of footage shows between ${name(c.t)} and ` +
        `${name(next.t)}: start ${name(next.t)} where ${name(c.t)} ends, or leave at least 1/3 s, so the screen never ` +
        "changes more than 3 times a second");
    if (c.stretch && e - s < beats(2))
      throw new Error(`${name(c.t)} stretches: it holds narrow for a beat, then widens over the next, so it needs at ` +
        `least 2 beats (${(2 * beat).toFixed(2)} s at ${bpm} BPM); 3 look better`);
    if (c.kind === "stack" && e - s < beats(c.rows.length))
      throw new Error(`the stack ${name(c.t)} lands one line per beat, so its ${c.rows.length} lines need at least ` +
        `${c.rows.length} beats (${(c.rows.length * beat).toFixed(2)} s at ${bpm} BPM); one more beat reads better`);
  }
  return cards.map(({ t, ...c }) => c);
}

export async function prepare(ctx) {
  const look = ctx.plan.look ?? {};
  if (!ctx.plan.clips?.length) { // the black video is as long as the cards were at prep
    const want = BLANK(ctx.plan).dur;
    if (Math.abs(want - ctx.dur) > 1 / 60)
      throw new Error(`the cards now end at ${want.toFixed(2)} s but the video is ${ctx.dur.toFixed(2)} s long: run prep ` +
        "again (with no clips, prep makes the black video as long as the cards)");
  }
  const beat = 60 / (look.bpm ?? 150), steps = stretchSteps(beat);
  const cards = timeline(ctx.plan.texts ?? [], look, ctx.dur).map((c) => (c.stretch ? { ...c, steps } : c));
  return { beat, cards, accent2: full(look.accent2 ?? "#FF3B30") };
}

// v1's events at about 30% of its levels (Saagii, 14 Nov: "tone down"; 15 Nov, on this look: "a bit too much");
// members raise them with "sfx": {"volume": …}. A thud as each word slams in (louder on "emphasis" cards, never two
// within 0.5 s), a swish as a word starts to stretch, a click as a stack line lands, but never within 0.5 s of a
// thud or of the last click, so a fast stack clicks on every other line.
export function sfx(plan, ctx) {
  const look = plan.look ?? {}, beat = 60 / (look.bpm ?? 150);
  const cards = timeline(plan.texts ?? [], look, ctx.dur);
  const ms = (t) => Math.round(t * 1000) / 1000;
  const ev = [], thuds = [];
  let last = -1;
  for (const c of cards.filter((c) => c.kind === "word")) {
    if (c.start - last >= 0.5 - 1e-9) {
      last = c.start;
      thuds.push(c.start);
      ev.push({ sound: "thud", at: ms(c.start), volume: c.emphasis ? 0.3 : 0.15 });
    }
    if (c.stretch) ev.push({ sound: "swish", at: ms(c.start + beat), volume: 0.25 });
  }
  last = -1;
  for (const c of cards.filter((c) => c.kind === "stack"))
    for (let j = 0; j < c.rows.length; j++) {
      const t = c.start + j * beat;
      if (t - last < 0.5 - 1e-9 || thuds.some((h) => Math.abs(t - h) < 0.5 - 1e-9)) continue;
      last = t;
      ev.push({ sound: "click", at: ms(t), volume: 0.3 });
    }
  return ev;
}
