import { readFileSync } from "node:fs";
import { join } from "node:path";

/*
  Intrinsic size of a WebP in /public, read straight from its header.

  The stacked event hero needs the poster's exact ratio: the box is sized by
  width there, and if its aspect does not match the file, `contain` letterboxes
  inside it and the picture drifts off the centre axis the copy is aligned to.

  This is read from the file rather than declared in src/data because the
  posters are re-exported constantly — five times in two days, at five
  different ratios — and a number kept by hand beside the path is a number that
  goes stale silently. The file is the truth; ask the file.

  Node-only: called from the event page, which is a server component rendered
  at build time. Never import this from a client component.
*/
export type ImageSize = { width: number; height: number };

export function webpSize(publicPath: string): ImageSize | null {
  let buf: Buffer;
  try {
    buf = readFileSync(join(process.cwd(), "public", publicPath));
  } catch {
    return null;
  }

  if (buf.length < 30) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buf.toString("ascii", 8, 12) !== "WEBP") return null;

  const chunk = buf.toString("ascii", 12, 16);

  // Lossy. 3-byte frame tag, then the 0x9d 0x01 0x2a start code, then two
  // 16-bit fields whose top two bits are scaling hints rather than size.
  if (chunk === "VP8 ") {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }

  // Lossless. 14 bits each, minus one, packed right after the signature byte.
  if (chunk === "VP8L") {
    if (buf[20] !== 0x2f) return null;
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  // Extended (alpha, animation). Canvas size as two 24-bit fields, minus one.
  if (chunk === "VP8X") {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }

  return null;
}
