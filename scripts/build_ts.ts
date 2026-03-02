import { build, spawnSync } from "bun";
import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const DIST_DIR = join(import.meta.dir, "../dist");
const SRC_FILE = join(import.meta.dir, "../src/index.ts");

console.log("🚀 Starting TypeScript build...");

// 1. Ensure dist directory exists
if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
}

async function runBuild() {
    console.log("📦 Bundling index.js and index.mjs...");

    // Build commonjs/esm versions
    const result = await Promise.all([
        build({
            entrypoints: [SRC_FILE],
            outdir: DIST_DIR,
            naming: "index.js",
            target: "browser",
            minify: true,
            external: ["./openzl.js"],
        }),
        build({
            entrypoints: [SRC_FILE],
            outdir: DIST_DIR,
            naming: "index.mjs",
            target: "browser",
            minify: true,
            external: ["./openzl.js"],
        }),
    ]);

    for (const r of result) {
        if (!r.success) {
            console.error("❌ Build failed:");
            for (const msg of r.logs) {
                console.error(msg);
            }
            process.exit(1);
        }
    }

    console.log("✨ Bundling complete.");

    // 2. Generate type declarations
    console.log("📝 Generating type declarations...");
    const tsc = spawnSync(["bun", "x", "tsc", "--emitDeclarationOnly"], {
        stdout: "inherit",
        stderr: "inherit",
    });

    if (tsc.exitCode !== 0) {
        console.error("❌ tsc failed");
        process.exit(1);
    }

    console.log("✅ Build complete!");
}

runBuild().catch(err => {
    console.error("❌ Unexpected error during build:", err);
    process.exit(1);
});
