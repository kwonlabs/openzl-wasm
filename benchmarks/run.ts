import { OpenZL } from "../dist/index.js";

async function runBenchmark() {
  console.log("🚀 Initializing OpenZL Benchmark...");
  await OpenZL.load();

  const iterations = 10;
  const dataSize = 5 * 1024 * 1024; // 5MB

  // 1. Structured Data (JSON-like)
  const structuredData = new TextEncoder().encode(
    JSON.stringify(
      Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        name: `User_${i}`,
        email: `user_${i}@example.com`,
        score: Math.floor(Math.random() * 100),
        active: i % 2 === 0,
        tags: ["compression", "wasm", "benchmark", "openzl"],
      })),
    ).slice(0, dataSize),
  );

  // 2. Random Data (High Entropy)
  const randomData = new Uint8Array(dataSize);
  for (let i = 0; i < randomData.length; i += 65536) {
    const size = Math.min(randomData.length - i, 65536);
    crypto.getRandomValues(randomData.subarray(i, i + size));
  }

  const testCases = [
    { name: "Structured JSON", data: structuredData },
    { name: "Random Bytes", data: randomData },
  ];

  console.log(
    "\n| Dataset | Original | Compressed | Ratio | Comp. Speed | Decomp. Speed |",
  );
  console.log(
    "|---------|----------|------------|-------|-------------|---------------|",
  );

  for (const test of testCases) {
    const { name, data } = test;
    const originalSize = data.length;

    // Warm up
    OpenZL.compress(data);

    // Benchmark Compression
    const startComp = performance.now();
    let lastCompressed: Uint8Array = new Uint8Array(0);
    for (let i = 0; i < iterations; i++) {
      lastCompressed = OpenZL.compress(data);
    }
    const endComp = performance.now();
    const compTime = (endComp - startComp) / iterations; // ms
    const compSpeed = originalSize / (1024 * 1024) / (compTime / 1000); // MB/s

    // Benchmark Decompression
    const startDecomp = performance.now();
    for (let i = 0; i < iterations; i++) {
      OpenZL.decompress(lastCompressed);
    }
    const endDecomp = performance.now();
    const decompTime = (endDecomp - startDecomp) / iterations; // ms
    const decompSpeed = originalSize / (1024 * 1024) / (decompTime / 1000); // MB/s

    const ratio = (originalSize / lastCompressed.length).toFixed(2);

    console.log(
      `| ${name.padEnd(10)} | ${(originalSize / 1024 / 1024).toFixed(1)}MB | ${(lastCompressed.length / 1024 / 1024).toFixed(2)}MB | x${ratio} | ${compSpeed.toFixed(1)} MB/s | ${decompSpeed.toFixed(1)} MB/s |`,
    );
  }
  console.log("");
}

runBenchmark().catch(console.error);
