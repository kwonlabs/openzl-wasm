#include "openzl/openzl.h"
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <vector>

using namespace emscripten;

// Utility to convert Uint8Array to std::vector
std::vector<uint8_t> valToVec(val data) {
  unsigned int length = data["length"].as<unsigned int>();
  std::vector<uint8_t> vec(length);
  auto view = val(typed_memory_view(length, vec.data()));
  view.call<void>("set", data);
  return vec;
}

// Simple version string
std::string version() {
  return std::to_string(ZL_LIBRARY_VERSION_MAJOR) + "." +
         std::to_string(ZL_LIBRARY_VERSION_MINOR) + "." +
         std::to_string(ZL_LIBRARY_VERSION_PATCH);
}

// Basic compression wrapper
val compress(val input) {
  auto vec = valToVec(input);

  // Calculate bound
  size_t bound = ZL_compressBound(vec.size());
  std::vector<uint8_t> compressed(bound);

  ZL_CCtx *cctx = ZL_CCtx_create();
  if (!cctx) {
    throw std::runtime_error("Failed to create OpenZL compression context");
  }

  printf("C++ Input size: %zu, Bound: %zu\n", vec.size(), bound);

  // Explicitly set format version
  ZL_CCtx_setParameter(cctx, ZL_CParam_formatVersion,
                       ZL_getDefaultEncodingVersion());

  ZL_Report report =
      ZL_CCtx_compress(cctx, compressed.data(), bound, vec.data(), vec.size());

  if (ZL_isError(report)) {
    ZL_ErrorCode err = ZL_errorCode(report);
    printf("C++ Compression Error Code: %d\n", (int)err);
    std::string error = ZL_CCtx_getErrorContextString(cctx, report);
    ZL_CCtx_free(cctx);
    throw std::runtime_error("Compression failed: " + error);
  }

  size_t compressedSize = ZL_validResult(report);
  compressed.resize(compressedSize);

  ZL_CCtx_free(cctx);

  return val::global("Uint8Array")
      .new_(typed_memory_view(compressedSize, compressed.data()));
}

// Basic decompression wrapper
val decompress(val input) {
  auto vec = valToVec(input);

  // Get decompressed size
  ZL_Report dSizeReport = ZL_getDecompressedSize(vec.data(), vec.size());
  if (ZL_isError(dSizeReport)) {
    throw std::runtime_error("Failed to get decompressed size");
  }
  size_t dSize = ZL_validResult(dSizeReport);

  std::vector<uint8_t> decompressed(dSize);
  ZL_Report report =
      ZL_decompress(decompressed.data(), dSize, vec.data(), vec.size());

  if (ZL_isError(report)) {
    throw std::runtime_error("Decompression failed");
  }

  return val::global("Uint8Array")
      .new_(typed_memory_view(dSize, decompressed.data()));
}

EMSCRIPTEN_BINDINGS(openzl_wasm) {
  function("version", &version);
  function("compress", &compress);
  function("decompress", &decompress);
}
