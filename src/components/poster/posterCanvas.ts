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

const W = 768;
const H = 1024;

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
  onRepaint?: () => void,
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
        Contain, so the whole poster is on the plate.

        Cover cropped a 2:3 poster into this 3:4 plane, which cut a band off
        the artwork on the one page where the posters are the entire design.
        The plate is painted in the event's ground first, so what shows either
        side of the poster is a narrow mount rather than a hole.
      */
      const scale = Math.min(W / img.width, H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      onRepaint?.();
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
