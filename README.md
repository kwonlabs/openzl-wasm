# openzl-wasm

WebAssembly port of Meta's **OpenZL** (Structured Data Compression Framework).

## Overview

`openzl-wasm` provides high-performance, structure-aware data compression for Web and Node.js environments. By leveraging WebAssembly and Emscripten, it brings the power of Meta's [OpenZL](https://github.com/facebook/OpenZL) to the JavaScript ecosystem with minimal overhead and full type safety.

OpenZL is designed to achieve superior compression ratios and speeds by explicitly modeling data structures and patterns, making it ideal for columnar data, JSON-like structures, and repetitive datasets.

## Features

- **Blazing Fast**: Near-native compression and decompression speeds using optimized WASM binaries.
- **Structure-Aware**: Better compression ratios for structured data compared to general-purpose algorithms.
- **Universal**: Runs in modern browsers and Node.js.
- **Type-Safe**: First-class TypeScript support with comprehensive definitions.
- **Easy Integration**: Seamless integration with Bun and other modern package managers.

## Installation

```bash
bun add @kwonlabs/openzl-wasm
```

## Usage

### Basic Usage

```typescript
import { OpenZL } from '@kwonlabs/openzl-wasm';

// Check if ready (non-blocking)
if (OpenZL.isReady()) {
    console.log("OpenZL is ready!");
}

// Or wait for it to be ready
await OpenZL.load();
```

### Sync Usage (Blocking)

Sync calls require the module to be initialized. Use `await OpenZL.load()` before calling these if you aren't sure it's ready.

```typescript
// Data to compress (define once for all examples)
const data = new TextEncoder().encode(JSON.stringify({ 
  id: 1, 
  name: "OpenZL", 
  tags: ["compression", "wasm"] 
}));

// Compress
const compressed = OpenZL.compress(data);
console.log(`Original: ${data.length} bytes, Compressed: ${compressed.length} bytes`);

// Decompress
const decompressed = OpenZL.decompress(compressed);
const originalJson = new TextDecoder().decode(decompressed);
```

### Async Usage (Non-blocking & Auto-waiting)

Async versions will **automatically wait** for the module to load if it hasn't finished yet. You can call these immediately after import.

```typescript
// Compress Asynchronously (Auto-waits if loading)
const compressed = await OpenZL.compressAsync(data);

// Decompress Asynchronously
const decompressed = await OpenZL.decompressAsync(compressed);
```


## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

> [!NOTE]
> This project includes and links to **OpenZL**, which is developed by Meta and licensed under the **BSD 3-Clause License**. The original license is maintained within the submodule at `vendor/OpenZL/LICENSE`.
