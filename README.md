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

// Initialize the WASM module
const ozl = await OpenZL.load();

// Data to compress
const data = new TextEncoder().encode(JSON.stringify({ 
  id: 1, 
  name: "OpenZL", 
  tags: ["compression", "wasm"] 
}));

// Compress
const compressed = ozl.compress(data);
console.log(`Original: ${data.length} bytes, Compressed: ${compressed.length} bytes`);

// Decompress
const decompressed = ozl.decompress(compressed);
const originalJson = new TextDecoder().decode(decompressed);
```


## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

> [!NOTE]
> This project includes and links to **OpenZL**, which is developed by Meta and licensed under the **BSD 3-Clause License**. The original license is maintained within the submodule at `vendor/OpenZL/LICENSE`.
