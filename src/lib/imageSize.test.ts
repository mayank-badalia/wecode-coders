import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { events } from "@/data/events";
import { webpSize } from "./imageSize";

/*
  Synthetic headers with known dimensions.

  The real posters only prove the parser does not crash — they cannot prove it
  read the right bytes, because there is no second decoder here to check them
  against. These encode a size by hand and assert it comes back.
*/
function riff(fourcc: string, payload: Buffer): Buffer {
  const head = Buffer.alloc(12);
  head.write("RIFF", 0, "ascii");
  head.writeUInt32LE(payload.length + 4 + fourcc.length, 4);
  head.write("WEBP", 8, "ascii");
  const tag = Buffer.alloc(8);
  tag.write(fourcc, 0, "ascii");
  tag.writeUInt32LE(payload.length, 4);
  return Buffer.concat([head, tag, payload]);
}

function lossy(width: number, height: number): Buffer {
  const p = Buffer.alloc(24);
  // 3-byte frame tag, then the start code the parser checks for.
  p[3] = 0x9d;
  p[4] = 0x01;
  p[5] = 0x2a;
  p.writeUInt16LE(width, 6);
  p.writeUInt16LE(height, 8);
  return riff("VP8 ", p);
}

function lossless(width: number, height: number): Buffer {
  const p = Buffer.alloc(16);
  p[0] = 0x2f;
  p.writeUInt32LE((width - 1) | ((height - 1) << 14), 1);
  return riff("VP8L", p);
}

function extended(width: number, height: number): Buffer {
  const p = Buffer.alloc(16);
  p.writeUIntLE(width - 1, 4, 3);
  p.writeUIntLE(height - 1, 7, 3);
  return riff("VP8X", p);
}

describe("webpSize", () => {
  it("reads the real posters and returns a sane portrait size", () => {
    const withArt = events.filter((e) => e.posterImage);
    expect(withArt.length).toBeGreaterThan(0);

    for (const e of withArt) {
      const size = webpSize(e.posterImage!);
      expect(size, `${e.slug} poster header should parse`).not.toBeNull();
      expect(size!.width).toBeGreaterThan(200);
      expect(size!.height).toBeGreaterThan(200);
      // Portrait or square — never landscape. Forge 48's artwork is square,
      // so this cannot demand portrait, but a landscape result would still
      // mean the width and height fields were read in the wrong order.
      expect(size!.height).toBeGreaterThanOrEqual(size!.width);
    }
  });

  it("returns null for a missing file rather than throwing", () => {
    expect(webpSize("/posters/does-not-exist.webp")).toBeNull();
  });

  it("returns null for a file that is not a WebP", () => {
    const notWebp = "/brand/logo.svg";
    if (!existsSync(join(process.cwd(), "public", notWebp))) return;
    expect(webpSize(notWebp)).toBeNull();
  });
});

/*
  Exercised through the exported function by writing the fixtures to disk,
  because webpSize reads from /public by design rather than taking a buffer.
*/
describe("webpSize header decoding", () => {
  const dir = join(process.cwd(), "public", "__imagesize_fixtures__");

  const cases: [string, (w: number, h: number) => Buffer][] = [
    ["VP8 ", lossy],
    ["VP8L", lossless],
    ["VP8X", extended],
  ];

  for (const [name, build] of cases) {
    it(`decodes a ${name} header`, () => {
      mkdirSync(dir, { recursive: true });
      const file = join(dir, `${name.trim()}.webp`);
      writeFileSync(file, build(1122, 1402));
      try {
        expect(webpSize(`/__imagesize_fixtures__/${name.trim()}.webp`)).toEqual({
          width: 1122,
          height: 1402,
        });
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
});
