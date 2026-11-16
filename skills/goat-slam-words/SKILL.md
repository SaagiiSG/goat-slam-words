---
name: goat-slam-words
description: Slam Words · Том үг. Turns a price, offer, spec or tip into giant Mongolian words that fill the screen edge to edge and slam in one card at a time, over a solid brand colour, black, white or darkened footage, timed to the speech or the beat. Words can stretch wide, start as an outline and fill in, or stack into a poster with red rules. Built on HyperFrames. Works with no footage at all (a black background). Renders a 1080x1920 MP4 for Reels/TikTok. Fits every business type: price lists (beauty, salon, nails, barber), sales and drops (retail, ecommerce), specs and price (auto), rooms and location (real estate), hooks and tips (health, coaching). Use whenever the user wants big text, kinetic type, a text-only video, an offer or price announcement, or types /goat-slam-words, /том-үг, or says "том үсэгтэй болго", "үнээ томоор харуул", "хямдралаа зарла", "big text video", "kinetic typography", even if they don't name the skill.
---

# Slam Words · Том үг

One to three giant words at a time fill the screen edge to edge and slam in (140% → 97% → 100%, then a short shake). Each card sits on a solid brand colour, on black, on white, or on the footage darkened to 45%. A word can start narrow and stretch wide, or start as an outline and fill in. A stack card lands 3–5 lines one per beat, with red rules drawing across between them, like a poster. Between cards the footage plays untouched. It is the only GOAT look where text, not footage, fills the screen.

**Good for:** prices, offers, specs and tips for every business: "ӨНӨӨДӨР ИХ ХЯМДРАЛ", a menu of services, a car's price and year, rooms and district, a coach's three tips.
**Not for:** the moment where the work itself is the proof (a finished nail set, a haircut reveal): the words cover and darken it. Say the offer in big words, then leave the last 1–2 s free so the result plays clean.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`. `goat` below means `node SKILL_DIR/scripts/goat.mjs`.

## 1. Setup check (first time on a machine)

**Every new video, first:** run `claude plugin marketplace update goat-slam-words`, then `claude plugin update goat-slam-words@goat-slam-words`. If it installs a new version, tell the user a new version was installed and ask them to type `/reload-plugins` before you go on. If either command fails (offline, or installed from a zip), carry on and don't mention it.

Run `node --version` (needs 22 or newer) and `ffmpeg -version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install node ffmpeg`
- Windows: `winget install OpenJS.NodeJS.LTS` and `winget install Gyan.FFmpeg`, then close and reopen the terminal.

The words here are words the user writes, not speech, so this look needs no speech model. The first render downloads, once, a private copy of Chrome that draws the frames. Tell the user the first run takes a while; after that it starts at once. Nothing is uploaded: everything runs on their computer, with no account.

**Long steps:** the first `render` (the Chrome download) can run longer than a normal command timeout. Run it in the background, or with a 600000 ms timeout, and wait for it to end. Never stop it and start it again.

**Windows has not been tested yet.** If a step fails there, show the error to the user in plain words.

## 2. Collect the words, colours and clips

Make `raw/` and `output/` in the current folder. Ask for:
1. **The words.** The offer, price, list or tip, in their own words. Break it into cards of 1–3 words each. Never invent a price, phone number, date or percentage. Ask.
2. **Brand colours,** if they have them (two at most): one for full-colour cards (default yellow #FFE800), one for the stack's rules and accent line (default red #FF3B30; the stack is on black, so pick a bright one). Black and white are always there.
3. **Clips (optional).** A talking head saying the offer, or b-roll of the work. Nothing is required: with no clips, the video is the cards on black, as long as the last card.
4. **Music (optional)** they are allowed to use in a file, and its tempo (BPM). If they'll add a song in the Instagram/TikTok app instead, time the cards to an even 150 BPM.

If there are clips, run `goat probe raw/*`. It prints each file's size, length, whether it has sound, whether it is HDR, and `speech` spans (when someone is talking).

**Time the cards.** On a talking clip, spread the cards over the `speech` spans from `probe`: start each card as the phrase it shows begins, and end it where the next card starts. With music and no speech, start every card on a beat and give each card 2–4 beats. One beat lasts `60 / BPM` seconds:

| BPM | 90 | 120 | 150 | 180 |
|---|---|---|---|---|
| one beat (s) | 0.667 | 0.500 | 0.400 | 0.333 |

Beat k falls at `k × 60 / BPM` seconds (round to 3 decimals). Nothing on screen can change faster than every 1/3 s (see "Flashes" in section 4), so at more than 180 BPM a card needs 2 beats or more.

## 3. Prepare

Write `plan.json` in the project folder (paths are relative to it):

```json
{
  "output": "output/slam-words.mp4",
  "clips": [
    {"src": "raw/talk.mov", "in": 0.3, "out": 7.5}
  ],
  "texts": [
    {"role": "word", "text": "ӨНӨӨДӨР", "start": 0.0, "end": 1.2, "stretch": true},
    {"role": "word", "text": "ИХ", "start": 1.2, "end": 2.4, "emphasis": true},
    {"role": "word", "text": "ХЯМДРАЛ", "start": 2.4, "end": 3.6, "style": "outline"},
    {"role": "stack", "text": "ЗАСАЛТ\nБУДАГ\nЭМЧИЛГЭЭ", "start": 3.6, "end": 5.2},
    {"role": "word", "text": "ЦАГ\nЗАХИАЛ", "start": 5.2, "end": 6.0, "bg": "accent"}
  ],
  "look": {"accent": "#FFE800", "accent2": "#FF3B30", "bpm": 150}
}
```

**clips** play in order. `in`/`out` trim a video (seconds); `dur` sets how long a photo shows. `cx`/`cy` (0–1, default 0.5) choose which part of a wider frame (a landscape clip, or a photo of another shape) the phone screen keeps; an upright 9:16 phone clip is kept whole. The clips' sound plays under every card. The footage shows on `footage` cards (darkened) and between cards (as filmed). The example leaves 6.0–7.2 s free, so the work plays clean at the end.

**No clips:** leave `"clips"` out. The video is black under the cards and ends at the last card's `end`. The first card must start at 0 (the first frame is the thumbnail) and the last one needs an `end`; `footage` cards are plain black with white words.

Then run these in order. Each one says what to run first if a step is missing.
1. `goat prep plan.json`: crops every clip to the full 1080x1920 screen and joins them into `.work-slam-words/main.mp4` (with no clips, a black video as long as the cards). **Run it again whenever `clips` change,** and with no clips, whenever the last card's `end` changes.
2. `goat cut plan.json`: this look never cuts pauses; the step only readies the video (`.work-slam-words/cut.mp4`) and takes a second.

## 4. Write the words

**texts:** one card shows at a time, from `start` to `end` (default: the next card's start, or the end of the video; a later card always ends the one before). Write words in capitals. Never invent a price, phone number, date or percentage.
- `word`: a big word card, centred at (540, 555) in the top half. 1 or 2 rows: break the line yourself with `\n` (two short rows are bigger than one long one). **At most 12 characters a row** (spaces count), **9 on a stretch card.** A longer row, an empty row or a third row is refused with a message. The rows are sized together so the longer one fills the 840 px safe width, up to 460 px type for one row and 300 px for two, down to 56 px: "ЦАГ" comes out at about 360 px, "БУДАГ" 220, "ӨНӨӨДӨР" 145, a full 12-character row 80–100 px; "ЦАГ\nЗАХИАЛ" at about 170. Even 12 of the widest letters (Ж Щ Ы Ю) fit at 56 px; only rare symbols such as ‰ can run past the edges. One row covers about y 390–720 at the largest size; two rows about y 315–795. On its first frame a word is 140% wide and can run off the screen's edges for that one frame: that is the slam. A card at `"start": 0` is already there, at rest, on the first frame. Options per card:
  - `bg`: `accent` (brand colour, black words; white words if the colour is dark), `black` (brand-colour words; white if the colour is dark), `white` (black words), `footage` (the footage darkened to 45%, white words). If you leave it out, cards take `accent`, `black`, `footage` in turn. The words sit over the top half of the screen, so on a `footage` card pick a shot with no face there (hands, the work, a room, the back of a head); over a talking head, use a solid colour.
  - `style`: `fill` (default) or `outline` (outline letters that fill in two-thirds of the way through the card).
  - `emphasis`: `true` on the one or two cards that matter most (the price, the offer) gives them a louder thud.
  - `stretch`: `true` holds the word narrow for one beat, then widens it over the next beat, its height held. It is sized for its widest moment, so a stretch word comes out smaller: it reads best on a short word ("ШИНЭ" about 175 px, "ӨНӨӨДӨР" only 105). It needs at least 2 beats; give it 3.
- `stack`: 3–5 lines (split with `\n`) on black, **at most 16 characters a line**, from the top-left of the safe area (120, 288) down. One line lands per beat: white, then outline, then the second brand colour, in turn, with a rule drawing across under each in 4 frames. Each line fills 840 px, up to 240 px type (180 px with 5 lines), down to 42 px. Give it at least one beat per line; one more reads better.

**look** options:
- `accent`: the main brand colour, e.g. `"#FFE800"` (default yellow). Dark colours get white words automatically.
- `accent2`: the stack's rule and accent-line colour, e.g. `"#FF3B30"` (default red).
- `bpm`: the tempo (60–200, default 150). It sets how fast stack lines land and when a stretch starts.

**Flashes (seizure safety):** a cut between a white or yellow card and a black one changes the whole screen, so every card shows for at least 1/3 s (10 frames), and the footage between two cards is either none (the next card starts where the last ends) or at least 1/3 s. The screen never changes more than 3 times a second. A plan that breaks this is refused with a message naming the cards; give the card more time or join it to the next one.

**Auto sound effects** (soft; raise them with `"sfx": {"volume": 1.5}`): a thud as each word slams in (louder on `emphasis` cards, never two within 0.5 s), a swish as a word starts to stretch, a click as a stack line lands (never within 0.5 s of a thud or another click, so a fast stack clicks on every other line).

Before rendering, tell the user the plan in plain words (the cards in order with their colours, and when each comes in) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio-node.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `node SKILL_DIR/scripts/goat.mjs probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 5. Render and check

`goat render plan.json`

It draws the cards over the footage (or black), mixes the sound and writes the MP4 plus a contact sheet (one frame per second) at `.work-slam-words/sheet.jpg`. On our test Mac an 11.5 s video with 8 cards over 4 clips took 13–17 s to render and 4–5 s to prep; a 7.2 s video with no clips took 9 s to render and under 1 s to prep. Longer videos take longer. Run the next render only after the last one ends.

Cards can slip between the contact sheet's frames, so also make a quick sheet with a picture every 6 frames (80 pictures: 16 s; for a longer video add rows, e.g. `tile=10x12` for 24 s) and read it:
`ffmpeg -y -loglevel error -i output/slam-words.mp4 -vf "select='not(mod(n\,6))',scale=180:-2,tile=10x8" -frames:v 1 -fps_mode vfr output/check.jpg`
Then read the first frame and full-size frames inside each card of 0.5 s or more: 0.4 s after it starts (after the slam and shake; on an outline card of more than 0.6 s, still the outline) and 0.1 s before it ends (a stretch at its widest, an outline filled in, every stack line in). Skip cards under 0.5 s; the quick sheet shows them. For the example plan:
`ffmpeg -y -loglevel error -i output/slam-words.mp4 -frames:v 1 output/check-0.jpg`
`ffmpeg -y -loglevel error -ss 1.1 -i output/slam-words.mp4 -frames:v 1 output/check-1.1.jpg` (ӨНӨӨДӨР stretched wide)
`ffmpeg -y -loglevel error -ss 2.8 -i output/slam-words.mp4 -frames:v 1 output/check-2.8.jpg` (ХЯМДРАЛ as an outline; one more at 3.5, filled in)
`ffmpeg -y -loglevel error -ss 5.1 -i output/slam-words.mp4 -frames:v 1 output/check-5.1.jpg` (the stack, all three lines)
Check that:
- the first frame (the thumbnail) shows the first card or the footage;
- every word is spelled right (Ө ө Ү ү!), whole, and inside the screen;
- each card stays long enough to read (about 0.4 s per word on the card at least);
- the last moment shows the work, not words.

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 6. Hand over

Tell the user where the file is (`output/slam-words.mp4`) and that it is ready to post.

## Rules

- Every word and graphic on screen comes from what this video says or shows, or from what the user gave you. The examples in this file are only examples: never put them in a video. If the user hasn't given the words, ask.
- Never invent numbers. Prices, percentages, dates and phone numbers come from the user.
- Words stay inside the area no app buttons cover. Don't move them.
- Never more than 3 changes of the whole screen a second. The look enforces it (see "Flashes" above); don't try to get round it.
- Use only the font bundled in `SKILL_DIR/fonts` (Science Gothic, it has Ө ө Ү ү and ₮). The look keeps its width at 70 or more so the holes in Ө stay open. Don't swap in other fonts. Emoji and symbols such as ★ can't be drawn.
- Say the offer, then cut to the work: leave the result shot free of words.
- The output is 1080x1920, 30 fps, H.264. The clips' own sound, the voice-over and the music are brought to -14 LUFS together (Instagram/TikTok level; our music test came out at -13.9 LUFS) and the effects play on top. With nothing to bring up (silent clips or no clips, and no music or voice-over) the effects play alone, so such a reel is quieter than that (our no-clip test: -24 LUFS).
