import { formatEventDate } from "@/lib/format";
import { createRng, pick, range } from "@/lib/seededRandom";
import type { PublicEvent } from "@/lib/types";
import { GROUNDS, TITLE_TREATMENTS, groundFor, tint } from "./layouts";

/*
  Canvas-2D twin of <Poster>.

  WebGL planes need an image, and rendering the DOM poster to a texture is not
  something the platform offers cheaply. This draws the same composition from
  the same seed and the same GROUNDS table, so the two cannot drift apart: any
  change to the palette lands in both.
*/

/*
  The plate the ring's posters are painted onto.

  1024 wide, not the 768 it was. The source posters are 1254px across and the
  focused plate covers roughly 460 CSS pixels, which is 920 device pixels on a
  retina panel — so a 768px texture was being magnified on the one surface
  where the artwork is the entire design, and the fine print on it turned to
  mush. 1024 lands just under the source and just over the screen.

  Bigger is not free: this is nine textures with mipmaps, and 2048 would be
  four times the video memory for detail past what the panel can resolve.
*/
const W = 1024;
const H = 1365;

/**
 * next/font generates a hashed family name, so the real name has to be read
 * back off a rendered element rather than hardcoded.
 */
function resolveFamily(cssVar: string): string {
  const probe = document.createElement("span");
  probe.style.fontFamily = `var(${cssVar})`;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "sans-serif";
  probe.remove();
  return family;
}

/**
 * @param onRepaint Called once a real poster image has finished decoding and
 *   been drawn. Only fires for events with a `posterImage`; the caller uses it
 *   to mark its texture dirty, since the canvas is painted after it is handed
 *   over.
 */
export function posterToCanvas(
  event: PublicEvent,
  /** Called once the artwork is painted, with its aspect ratio (w / h). */
  onRepaint?: (ratio: number) => void,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  /*
    A locked event is drawn as a sealed plate: hatching and a padlock, nothing
    derived from its real content. It has no seed to compose from and must not
    resemble any particular published ground.
  */
  if (event.locked) {
    // Read from the shared token, never a second copy of it. These colours
    // used to be written out here as well as in Poster, and the two drifted
    // the moment one was tuned: the ring kept drawing the old near-black
    // plate while the DOM posters had already been lightened.
    const lockedGround = groundFor(event);
    const seal = (alpha: number) => tint(lockedGround.fg, alpha);

    ctx.fillStyle = lockedGround.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = seal(0.35);
    ctx.lineWidth = 3;
    for (let x = -H; x < W + H; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }

    ctx.strokeStyle = seal(0.55);
    ctx.lineWidth = 6;
    const cx = W / 2;
    const cy = H / 2;
    ctx.strokeRect(cx - 70, cy - 40, 140, 100);
    ctx.beginPath();
    ctx.arc(cx, cy - 40, 42, Math.PI, 0);
    ctx.stroke();

    const monoLocked = resolveFamily("--font-mono");
    ctx.font = `500 ${Math.round(W * 0.032)}px ${monoLocked}`;
    ctx.fillStyle = lockedGround.fg;
    ctx.textAlign = "center";
    ctx.fillText("LOCKED", cx, cy + 130);
    ctx.textAlign = "left";
    return canvas;
  }

  /*
    A real poster wins over the generated one here exactly as it does in the
    DOM poster. Without this branch an announced event showed its artwork
    everywhere on the site except the ring, which is the one surface where the
    posters are the whole page.

    Decoding is asynchronous and CanvasTexture wants a canvas now, so the
    ground is painted immediately — the seed's ground is chosen to match the
    artwork — and the image is drawn over it when it arrives.
  */
  if (event.posterImage) {
    const ground = groundFor(event);
    ctx.fillStyle = ground.bg;
    ctx.fillRect(0, 0, W, H);

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      /*
        The plate becomes the artwork, rather than the artwork being letterboxed
        onto a fixed plate.

        Containing a square poster on a 3:4 plate left a quarter of the tile
        filled with the event's seeded ground — a pink slab above and below
        Codex 48, a red one around CodeAxis. Read as a mount in theory and as
        a colour bar in practice, and it is the first thing that made the ring
        look unfinished. Resizing the canvas to the poster means there is no
        mount to look at, and the ring's plane is reshaped to match so nothing
        is stretched.

        Capped on the long edge: past this the texture costs video memory for
        detail no panel resolves, and there are nine of them.
      */
      /*
        Smaller on a phone: nine of these live on the GPU at once, and 1280px
        of poster is detail no handset resolves at arm's length. 1280 stays on
        a desktop panel, where the focused poster covers 900 device pixels.
      */
      const CAP = window.matchMedia("(pointer: coarse)").matches ? 768 : 1280;
      const fit = Math.min(1, CAP / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * fit));
      const h = Math.max(1, Math.round(img.height * fit));

      /*
        Resizing clears the bitmap and resets the context's state, so the draw
        happens after it. The context object itself survives a resize, which is
        why this keeps using the one it already has rather than asking for it
        again — a second getContext() would also be a second chance to get null.
      */
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      onRepaint?.(w / h);
    };
    img.src = event.posterImage;
    return canvas;
  }

  const rng = createRng(event.posterSeed);
  const ground = pick(rng, GROUNDS);
  const treatment = pick(rng, TITLE_TREATMENTS);
  pick(rng, ["top", "centre", "bottom"]); // keep the draw order identical to the DOM poster

  const halftone = Math.round(range(rng, 8, 18)) * 2;
  const words = event.title.toUpperCase().split(" ");
  const longest = Math.max(...words.map((w) => w.length));
  const ruleCount = Math.round(range(rng, 3, 5));
  const rules = Array.from({ length: ruleCount }, () => range(rng, 12, 88));

  // Ground
  ctx.fillStyle = ground.bg;
  ctx.fillRect(0, 0, W, H);

  // Halftone
  ctx.fillStyle = ground.accent;
  ctx.globalAlpha = 0.25;
  for (let y = halftone / 2; y < H; y += halftone) {
    for (let x = halftone / 2; x < W; x += halftone) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Hairline rules
  ctx.strokeStyle = ground.accent;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 2;
  for (const pct of rules) {
    const x = (pct / 100) * W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Title
  const display = resolveFamily("--font-display");
  const size = Math.min(150, (W * 1.5) / longest);
  ctx.font = `700 ${size}px ${display}`;
  ctx.textBaseline = "top";

  const pad = W * 0.07;
  let y = pad;
  words.forEach((word, i) => {
    const outlined = treatment === "outline" || (treatment === "mixed" && i > 0);
    if (outlined) {
      ctx.strokeStyle = ground.fg;
      ctx.lineWidth = 2.5;
      ctx.strokeText(word, pad, y);
    } else {
      ctx.fillStyle = ground.fg;
      ctx.fillText(word, pad, y);
    }
    y += size * 0.88;
  });

  // Metadata
  const mono = resolveFamily("--font-mono");
  ctx.font = `500 ${Math.round(W * 0.028)}px ${mono}`;
  ctx.fillStyle = ground.fg;
  ctx.globalAlpha = 0.85;
  ctx.fillText(formatEventDate(event.startsAt, event.endsAt).toUpperCase(), pad, H - pad - 60);
  ctx.fillText(event.format.replace("-", " ").toUpperCase(), pad, H - pad - 24);
  ctx.globalAlpha = 1;

  return canvas;
}
