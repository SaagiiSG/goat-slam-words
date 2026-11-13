# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["pillow>=10.4", "numpy>=1.26"]
# ///
"""Slam Words · Том үг.

One to three giant words at a time that fill the screen edge to edge and slam in, over a solid
brand colour, black, or darkened footage. Words can stretch wide, start as an outline and fill in,
or build a poster stack with red rules drawing across. Between words the footage plays untouched.
Usage: uv run render.py plan.json
"""
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import goatcut as g  # noqa: E402
from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageFilter  # noqa: E402

NAME = "slam-words"
GRADE = ""                     # footage stays as filmed; it is darkened only under words
FONT = "ScienceGothic[CTRS,slnt,wdth,wght].ttf"
NARROW, WIDE = 70, 125         # width axis; narrower than 70 at weight 900 and the holes in Ө close up
DIM = 0.45                     # footage under words keeps 45% of its light
BGS = ("accent", "black", "footage")  # words take these backgrounds in turn unless the plan says
STYLES = ("fill", "outline")
CX, CY = 540, 555              # words sit centred in the hero band (y 270-840)
W, H, FPS = g.W, g.H, g.FPS


def colour(ctx, key, default):
    try:
        return ImageColor.getrgb(ctx.opt(key, default))[:3]
    except (ValueError, AttributeError):
        g.die(f'look.{key} must be a colour like "#FFE800"')


def light(rgb):
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] > 140


def setup(ctx):
    bpm = float(ctx.opt("bpm", 150))
    if not 60 <= bpm <= 200:
        g.die("look.bpm must be between 60 and 200")
    ctx.beat = 60 / bpm
    ctx.accent, ctx.accent2 = colour(ctx, "accent", "#FFE800"), colour(ctx, "accent2", "#FF3B30")
    black, white = (0, 0, 0), (255, 255, 255)
    ctx.look = {  # background -> (background colour, word colour)
        "accent": (ctx.accent, black if light(ctx.accent) else white),
        "black": (black, ctx.accent if light(ctx.accent) else white),
        "white": (white, black),
        "footage": (None, white),
    }
    for item in ctx.texts():
        if item.get("role") not in ("word", "stack"):
            g.die(f'text role "{item.get("role")}" is not used by this look: use "word" or "stack"')
    for i, item in enumerate(ctx.texts("word")):
        item.setdefault("bg", BGS[i % len(BGS)])
        if item["bg"] not in ctx.look:
            g.die(f'word "{item["text"]}": bg must be one of {", ".join(ctx.look)}')
        if item.get("style", "fill") not in STYLES:
            g.die(f'word "{item["text"]}": style must be "fill" or "outline"')


def SFX(ctx):
    # A thud as a word slams in (full on "emphasis" words, quieter on the rest, at most 2 a second),
    # a swish as a word stretches, a click as each stack line lands.
    ev, last = [], -1.0
    for x in ctx.texts("word"):
        if x.get("start", 0) - last >= 0.5:
            last = x.get("start", 0)
            ev.append({"sound": "thud", "at": last, "volume": 1.0 if x.get("emphasis") else 0.5})
        if x.get("stretch"):
            ev.append({"sound": "swish", "at": x.get("start", 0) + ctx.beat, "volume": 0.8})
    for x in ctx.texts("stack"):
        ev += [{"sound": "click", "at": x.get("start", 0) + j * ctx.beat} for j in range(len(x["text"].split("\n")))]
    return ev


def stacked(text, font, gap, **kw):
    """Centred multi-line sprite, one text_sprite per line (core text_sprite crashes on centred multi-line text)."""
    rows = [g.text_sprite(ln, font, **kw) for ln in text.split("\n")]
    w = max(r.width for r in rows)
    out = Image.new("RGBA", (w, sum(r.height for r in rows) + gap * (len(rows) - 1)), (0, 0, 0, 0))
    y = 0
    for r in rows:
        out.alpha_composite(r, ((w - r.width) // 2, y))
        y += r.height + gap
    return out


def outline(sprite, width, rgb):
    """Keep only a ring `width` px wide inside each letter's edge, so the holes in Ө О Р stay open."""
    a = sprite.getchannel("A")
    out = Image.new("RGBA", sprite.size, rgb + (0,))
    out.putalpha(ImageChops.subtract(a, a.filter(ImageFilter.MinFilter(width * 2 + 1))))
    return out


def word_sprite(ctx, item, wdth, hollow):
    fitted = ctx.fit(item["text"], FONT, 840, 460, 60, axes={"wdth": WIDE if item.get("stretch") else NARROW,
                                                             "wght": 900})
    f = ctx.font(FONT, fitted.size, {"wdth": wdth, "wght": 900})
    rgb = ctx.look[item["bg"]][1]
    s = stacked(item["text"], f, f.size // 12, fill=rgb + (255,))
    return outline(s, max(5, f.size // 30), rgb) if hollow else s


def stack_sprites(ctx, item):
    lines = item["text"].split("\n")
    cap = min(240, 900 // len(lines))
    out = []
    for j, ln in enumerate(lines):  # filled, outline, accent colour, in turn
        f = ctx.fit(ln, FONT, 840, cap, 40, axes={"wdth": NARROW, "wght": 900})
        rgb = ctx.accent2 if j % 3 == 2 else (255, 255, 255)
        s = g.text_sprite(ln, f, fill=rgb + (255,))
        out.append(outline(s, max(5, f.size // 30), rgb) if j % 3 == 1 else s)
    return out


def background(ctx, img, bg):
    rgb = ctx.look[bg][0]
    if rgb is None:
        return img.point(lambda v: int(v * DIM)).convert("RGBA")
    return ctx.cache(("bg", rgb), lambda: Image.new("RGBA", (W, H), rgb + (255,))).copy()


def frame(img, t, ctx):
    items = [x for x in ctx.active(t) if x.get("role") in ("word", "stack")]
    if not items:
        return img
    item = items[-1]
    i, lt = ctx.texts().index(item), t - item.get("start", 0)

    if item["role"] == "stack":  # one line lands per beat; a rule draws across under it in 4 frames
        canvas = background(ctx, img, "black")
        dr, y = ImageDraw.Draw(canvas), 288
        lines = ctx.cache(("stack", i), lambda: stack_sprites(ctx, item))
        for j, s in enumerate(lines):
            if lt >= j * ctx.beat:
                g.paste(canvas, s, 120, y)
            y += s.height + 14
            p = g.clamp((lt - j * ctx.beat) / (4 / FPS))
            if j < len(lines) - 1 and p > 0:
                dr.rectangle((120, y, 120 + 840 * p, y + 5), fill=ctx.accent2)
            y += 20
        return canvas

    canvas = background(ctx, img, item["bg"])
    wdth = NARROW
    if item.get("stretch"):  # hold narrow for a beat, then widen to fill the screen over the next beat
        wdth = round(NARROW + (WIDE - NARROW) * g.ease_in_out((lt - ctx.beat) / ctx.beat))
    hollow = item.get("style") == "outline" and lt < (item.get("end", ctx.dur) - item.get("start", 0)) * 2 / 3
    s = ctx.cache(("w", i, wdth, hollow), lambda: word_sprite(ctx, item, wdth, hollow))
    k, dx, dy = int(lt * FPS), 0, 0
    if k < 2:  # slam: 140% -> 97% -> 100%
        sc = (1.4, 0.97)[k]
        s = s.resize((int(s.width * sc), int(s.height * sc)), Image.BILINEAR)
    elif k < 5:  # then three frames of shake, dying out
        r, a = random.Random(i * 10 + k), 9 * (5 - k) / 3
        dx, dy = r.uniform(-a, a), r.uniform(-a, a)
    g.paste(canvas, s, CX + dx, CY + dy, anchor="mm")
    return canvas


if __name__ == "__main__":
    g.run(sys.modules[__name__])
