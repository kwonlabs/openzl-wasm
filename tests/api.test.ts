import { describe, it, expect, beforeAll } from "vitest";
import { OpenZL } from "../dist/index.js";

describe("OpenZL WASM API", () => {
  beforeAll(async () => {
    await OpenZL.load();
  });

  it("should compress and decompress small data", async () => {
    const input = new TextEncoder().encode("Hello OpenZL!");
    const compressed = await OpenZL.compress(input);
    const decompressed = await OpenZL.decompress(compressed);
    expect(decompressed).toEqual(input);
  });

  it("should handle empty data", async () => {
    const input = new Uint8Array(0);
    const compressed = await OpenZL.compress(input);
    const decompressed = await OpenZL.decompress(compressed);
    expect(decompressed.length).toBe(0);
  });

  it("should handle parallel async compression calls", async () => {
    const data1 = new TextEncoder().encode("Parallel Test 1");
    const data2 = new TextEncoder().encode("Parallel Test 2");
    const data3 = new TextEncoder().encode("Parallel Test 3");

    const [c1, c2, c3] = await Promise.all([
      OpenZL.compressAsync(data1),
      OpenZL.compressAsync(data2),
      OpenZL.compressAsync(data3),
    ]);

    const [d1, d2, d3] = await Promise.all([
      OpenZL.decompressAsync(c1),
      OpenZL.decompressAsync(c2),
      OpenZL.decompressAsync(c3),
    ]);

    expect(d1).toEqual(data1);
    expect(d2).toEqual(data2);
    expect(d3).toEqual(data3);
  });

  it("should handle repeated data (2MB)", async () => {
    const input = new Uint8Array(2 * 1024 * 1024).fill(0x5a);
    const compressed = await OpenZL.compressAsync(input);
    const decompressed = await OpenZL.decompressAsync(compressed);
    expect(decompressed).toEqual(input);
    expect(compressed.length).toBeLessThan(input.length / 100);
  }, 10000);

  it("should handle random data (100KB)", async () => {
    const input = new Uint8Array(100 * 1024);
    for (let i = 0; i < input.length; i += 65536) {
      const size = Math.min(input.length - i, 65536);
      crypto.getRandomValues(input.subarray(i, i + size));
    }
    const compressed = await OpenZL.compressAsync(input);
    const decompressed = await OpenZL.decompressAsync(compressed);
    expect(decompressed).toEqual(input);
  }, 10000);

  it("should be stable over many iterations", async () => {
    for (let i = 0; i < 50; i++) {
      const data = new Uint8Array(256).fill(i % 256);
      const compressed = await OpenZL.compress(data);
      const decompressed = await OpenZL.decompress(compressed);
      expect(decompressed).toEqual(data);
    }
  });
});
