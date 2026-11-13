---
name: goat-slam-words
description: Slam Words · Том үг. Turns a price, offer, spec or tip into giant Mongolian words that fill the screen edge to edge and slam in one card at a time, over a solid brand colour, black, or darkened footage, timed to the speech or the beat. Words can stretch wide, start as an outline and fill in, or stack into a poster with red rules. Renders a 1080x1920 MP4 for Reels/TikTok. Fits every business type: price lists (beauty, salon, nails, barber), sales and drops (retail, ecommerce), specs and price (auto), rooms and location (real estate), hooks and tips (health, coaching). Use whenever the user wants big text, kinetic type, a text-only video, an offer or price announcement, or types /goat-slam-words, /том-үг, or says "том үсэгтэй болго", "үнээ томоор харуул", "хямдралаа зарла", "big text video", "kinetic typography", even if they don't name the skill.
---

# Slam Words · Том үг

One to three giant words at a time fill the screen edge to edge and slam in (140% → 97% → 100%, then a short shake). Each card sits on a solid brand colour, on black, or on the footage darkened to about half. A word can start narrow and stretch wide, or start as an outline and fill in. A stack card lands 3–5 lines one per beat, with red rules drawing across between them, like a poster. Between cards the footage plays untouched. It is the only GOAT look where text, not footage, fills the screen.

**Good for:** prices, offers, specs and tips for every business: "ӨНӨӨДӨР 30% ХЯМДРАЛ", a menu of services, a car's price and year, rooms and district, a coach's three tips.
**Not for:** the moment where the work itself is the proof (a finished nail set, a haircut reveal): the words cover and darken it. Say the offer in big words, then leave the last 1–2 s free so the result plays clean.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`.

## 1. Setup check (first time on a machine)

Run `ffmpeg -version` and `uv --version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install ffmpeg uv`
- Windows: `winget install Gyan.FFmpeg` and `winget install astral-sh.uv`, then close and reopen the terminal.

The first render downloads a small Python package (Pillow) once. After that it is instant.

## 2. Collect the words, colours and clips

Make `raw/` and `output/` in the current folder. Ask for:
1. **The words.** The offer, price, list or tip, in their own words. Break it into cards of 1–3 words each. Never invent a price, phone number, date or percentage. Ask.
2. **Brand colours,** if they have them (two at most): one for full-colour cards (default yellow #FFE800), one for the stack's rules and accent line (default red #FF3B30). Black and white are always there.
3. **Clips (optional).** A talking head saying the offer, or b-roll of the work. Nothing is required: with no footage, make a black still and use it as the only clip:
   `ffmpeg -y -loglevel error -f lavfi -i color=c=black:s=1080x1920 -frames:v 1 raw/black.png` (then `{"src": "raw/black.png", "dur": 8}` in the plan).

Then run: `uv run SKILL_DIR/scripts/goatcut.py probe raw/*`
It prints each file's size, length, whether it has sound, whether it is HDR, and `speech` spans (when someone is talking).

**Time the words to the speech.** If this folder was already edited with `goat-video-editor`, use `output/cut.mp4` as the clip and read `transcript/cut_words.json`: it lists every spoken word with its `start` and `end` in seconds. Start each card on the first word it shows and end it where the next card starts. Without that file, spread the cards over the `speech` spans from `probe`. With music and no speech, start every card on a beat (one beat = 60 / BPM seconds; 150 BPM = 0.4 s) and give each card 2–4 beats.

## 3. Write plan.json

Write `plan.json` in the project folder. Paths are relative to it.

```json
{
  "output": "output/slam-words.mp4",
  "clips": [
    {"src": "raw/talk.mov", "in": 0.3, "out": 7.0}
  ],
  "texts": [
    {"role": "word", "text": "ӨНӨӨДӨР", "start": 0.0, "end": 1.2, "stretch": true},
    {"role": "word", "text": "30%", "start": 1.2, "end": 2.4},
    {"role": "word", "text": "ХЯМДРАЛ", "start": 2.4, "end": 3.6, "style": "outline"},
    {"role": "stack", "text": "ЗАСАЛТ\nБУДАГ\nЭМЧИЛГЭЭ", "start": 3.6, "end": 5.2},
    {"role": "word", "text": "ЦАГ\nЗАХИАЛ", "start": 5.2, "end": 6.0, "bg": "accent"}
  ],
  "look": {"accent": "#FFE800", "accent2": "#FF3B30", "bpm": 150}
}
```

**clips** play in order. `in`/`out` trim a video (seconds); `dur` sets how long a photo shows. `cx`/`cy` (0–1, default 0.5) choose which part of a wide frame is kept. The clips' sound plays under every card. The footage shows only on `footage` cards (darkened) and between cards (as filmed).

**texts:** one card shows at a time, from `start` to `end`. Write words in capitals. Use `\n` to split a card into two lines: two short lines are bigger than one long one. Every line is sized to fill the safe width (840 px), so long Mongolian words get smaller automatically.
- `word`: a big word card, centred in the top half. Options per card:
  - `bg`: `accent` (brand colour, black words), `black` (brand-colour words), `white` (black words), `footage` (the footage darkened to 45%, white words). If you leave it out, cards take `accent`, `black`, `footage` in turn.
  - `style`: `fill` (default) or `outline` (outline letters that fill in two-thirds of the way through the card).
  - `emphasis`: `true` on the one or two cards that matter most (the price, the offer) gives them a full-volume thud.
  - `stretch`: `true` holds the word narrow for one beat, then widens it to fill the screen over the next beat. Give a stretch card at least 3 beats.
- `stack`: 3–5 lines (split with `\n`) on black. One line lands per beat: white, then outline, then the second brand colour, in turn, with a rule drawing across under each. Give it at least one beat per line plus one.

**look** options:
- `accent`: the main brand colour, e.g. `"#FFE800"` (default yellow). Dark colours get white words automatically.
- `accent2`: the stack's rule and accent-line colour, e.g. `"#FF3B30"` (default red).
- `bpm`: the tempo (60–200, default 150). It sets how fast stack lines land and when a stretch starts.

**Auto sound effects:** a thud as each word slams in (full volume on cards with `"emphasis": true`, quieter on the rest, never more than 2 a second), a swish as a word stretches, a click as each stack line lands.

Before rendering, tell the user the plan in plain words (the cards in order with their colours, and when each comes in) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `goatcut.py probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 4. Render and check

`uv run SKILL_DIR/scripts/render.py plan.json`

A 30 s video takes about 20–40 s. Then make a contact sheet and read it:
`ffmpeg -y -loglevel error -i output/slam-words.mp4 -vf "select='not(mod(n\,15))',scale=180:-2,tile=8x3" -frames:v 1 -fps_mode vfr output/check.jpg`
Check that every word is spelled right (Ө ө Ү ү!), nothing is cut off, each card stays long enough to read (about 0.4 s per word on the card at least), and the last moment shows the work, not words.

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 5. Hand over

Tell the user where the file is (`output/slam-words.mp4`) and that it is ready to post.

## Rules

- Never invent numbers. Prices, percentages, dates and phone numbers come from the user.
- Words stay inside the area no app buttons cover. Don't move them.
- Use only the font bundled in `SKILL_DIR/fonts` (Science Gothic, it has Ө ө Ү ү). The renderer keeps its width at 70 or more so the holes in Ө stay open. Don't swap in other fonts.
- Say the offer, then cut to the work: leave the result shot free of words.
- The output is 1080x1920, 30 fps, H.264, sound normalised to -14 LUFS (Instagram/TikTok level).
