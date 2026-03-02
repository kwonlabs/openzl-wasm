/**
 * @kwonlabs/openzl-wasm
 * TypeScript wrapper for Meta's OpenZL compression library.
 */

export interface OpenZLModule {
  version(): string;
  compress(data: Uint8Array): Uint8Array;
  decompress(data: Uint8Array): Uint8Array;
}

// Emscripten generated module type
export interface OpenZLWasmModule {
  version(): string;
  compress(data: Uint8Array): Uint8Array;
  decompress(data: Uint8Array): Uint8Array;
}

let wasmModule: any = null;
let loadPromise: Promise<OpenZLModule> | null = null;

/**
 * Initializes the OpenZL WASM module.
 */
export async function init(moduleFactory: any): Promise<void> {
  if (wasmModule) return;
  wasmModule = await moduleFactory();
}

/**
 * Returns true if the OpenZL module is loaded and ready to use.
 */
export function isReady(): boolean {
  return wasmModule !== null;
}

/**
 * Automatically loads and initializes the OpenZL WASM module.
 * This assumes openzl.js is available in the same directory.
 */
export async function load(): Promise<OpenZLModule> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const specifier = ["./", "openzl", ".js"].join("");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - openzl.js is generated during build. Use dynamic construction to bypass Bun's static analysis.
    const module = await import(specifier);
    const OpenZLModuleFactory = module.default;
    await init(OpenZLModuleFactory);
    return OpenZL;
  })();

  return loadPromise;
}

/**
 * Returns the version of the OpenZL library.
 */
export function getVersion(): string {
  if (!wasmModule)
    throw new Error(
      "OpenZL module not initialized. Call init() or load() first.",
    );
  return wasmModule.version();
}

/**
 * Compresses the input data.
 */
export function compress(data: Uint8Array): Uint8Array {
  if (!wasmModule) {
    throw new Error(
      "OpenZL module not initialized. Call await OpenZL.load() first, or use OpenZL.compressAsync().",
    );
  }
  return wasmModule.compress(data);
}

/**
 * Compresses the input data asynchronously.
 * Automatically waits for the module to be loaded if it hasn't finished yet.
 */
export async function compressAsync(data: Uint8Array): Promise<Uint8Array> {
  if (!wasmModule) await load();
  return Promise.resolve().then(() => compress(data));
}

/**
 * Decompresses the input data.
 */
export function decompress(data: Uint8Array): Uint8Array {
  if (!wasmModule) {
    throw new Error(
      "OpenZL module not initialized. Call await OpenZL.load() first, or use OpenZL.decompressAsync().",
    );
  }
  return wasmModule.decompress(data);
}

/**
 * Decompresses the input data asynchronously.
 * Automatically waits for the module to be loaded if it hasn't finished yet.
 */
export async function decompressAsync(data: Uint8Array): Promise<Uint8Array> {
  if (!wasmModule) await load();
  return Promise.resolve().then(() => decompress(data));
}

export const OpenZL = {
  init,
  load,
  isReady,
  version: getVersion,
  compress,
  compressAsync,
  decompress,
  decompressAsync,
};

// Auto-trigger loading on import
load().catch((err) => {
  console.error("Failed to auto-load OpenZL WASM module:", err);
});

// Default export for ease of use
export default OpenZL;
