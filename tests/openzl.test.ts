import { describe, it, expect, beforeAll } from "vitest";
import { init, compress, decompress, getVersion } from "../src/index.js";
import OpenZLModuleFactory from "../dist/openzl-wasm.js";

describe("OpenZL WASM", () => {
    beforeAll(async () => {
        await init(OpenZLModuleFactory);
    });

    it("should report the correct version", () => {
        const version = getVersion();
        expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should compress and decompress small data", async () => {
        const input = new TextEncoder().encode("Hello OpenZL!");
        const compressed = await compress(input);
        const decompressed = await decompress(compressed);
        expect(decompressed).toEqual(input);
    });

    it("should handle empty data", async () => {
        const input = new Uint8Array(0);
        const compressed = await compress(input);
        const decompressed = await decompress(compressed);
        expect(decompressed.length).toBe(0);
    });

    it("should compress and decompress large repeated data (1MB)", async () => {
        const input = new Uint8Array(1024 * 1024).fill(0x41);
        const compressed = await compress(input);
        const decompressed = await decompress(compressed);
        expect(decompressed).toEqual(input);
        // Expect good compression ratio for repeated data
        expect(compressed.length).toBeLessThan(input.length / 100);
    });

    it("should compress and decompress high entropy data (16KB)", async () => {
        const input = new Uint8Array(Array.from({ length: 16384 }, () => Math.floor(Math.random() * 256)));
        const compressed = await compress(input);
        const decompressed = await decompress(compressed);
        expect(decompressed).toEqual(input);
    });

    it("should be stable over many iterations", async () => {
        for (let i = 0; i < 50; i++) {
            const data = new Uint8Array(512).fill(i % 256);
            const compressed = await compress(data);
            const decompressed = await decompress(compressed);
            expect(decompressed).toEqual(data);
        }
    });
});
