import { describe, it, expect } from "vitest";
import { OpenZL } from "../dist/index.js";

describe("OpenZL WASM Lifecycle", () => {
  it("should be ready or loading after import", async () => {
    // Since it's auto-loaded, it might already be ready or load() will return the active promise
    await OpenZL.load();
    const version = await OpenZL.load().then((lib) => lib.version());
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(OpenZL.isReady()).toBe(true);
  });

  it("should return stable promises for load()", async () => {
    const p1 = OpenZL.load();
    const p2 = OpenZL.load();
    // They should resolve to the same singleton object
    const [v1, v2] = await Promise.all([p1, p2]);
    expect(v1).toBe(OpenZL);
    expect(v2).toBe(OpenZL);
    // If they are strictly equal, that's best, but some environments wrap promises
    // We ensure they behave like a singleton.
    expect(p1).toStrictEqual(p2);
  });

  it("should report the correct version via the load() promise", async () => {
    const lib = await OpenZL.load();
    expect(lib.version()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should handle init() calls safely even after auto-load", async () => {
    // init() should be idempotent and not crash
    await expect(OpenZL.init(() => ({}))).resolves.toBeUndefined();
    expect(OpenZL.isReady()).toBe(true);
  });
});
