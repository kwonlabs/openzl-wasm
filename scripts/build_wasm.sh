#!/bin/bash
set -e

# scripts/build_wasm.sh
# This script compiles the C++ OpenZL source using Emscripten (emcc).

# 1. Configuration
EMSCRIPTEN_DOCKER_IMAGE="emscripten/emsdk:latest"
BUILD_DIR="build-wasm"
DIST_DIR="dist"
SRC_VENDOR="vendor/OpenZL"
BINDINGS_SRC="src/bindings.cpp"

# 2. Preparation
mkdir -p $BUILD_DIR
mkdir -p $DIST_DIR

# 3. Apply patches to submodule
echo "Applying patches to OpenZL submodule..."
git -C $SRC_VENDOR reset --hard 7e2cd2f
git -C $SRC_VENDOR apply ../../patches/fix-allocation-alignment.patch

# 4. Build with Docker
echo "Starting OpenZL WASM Build via Docker..."

docker run --rm \
    -v $(pwd):/src \
    -u $(id -u):$(id -g) \
    $EMSCRIPTEN_DOCKER_IMAGE \
    sh -c "emcmake cmake -B $BUILD_DIR -DCMAKE_BUILD_TYPE=Release -DOPENZL_ALLOW_INTROSPECTION=OFF -DOPENZL_BUILD_CLI=OFF -DOPENZL_BUILD_EXAMPLES=OFF -DOPENZL_BUILD_TESTS=OFF -DOPENZL_BUILD_BENCHMARKS=OFF -DOPENZL_BUILD_TOOLS=OFF && cmake --build $BUILD_DIR"

echo "WASM Build complete. Checking output..."
cp $BUILD_DIR/openzl.js $DIST_DIR/
cp $BUILD_DIR/openzl.wasm $DIST_DIR/

if [ ! -f "$DIST_DIR/openzl.js" ]; then
    echo "❌ Error: openzl.js was not generated"
    exit 1
fi

if [ ! -f "$DIST_DIR/openzl.wasm" ]; then
    echo "❌ Error: openzl.wasm was not generated"
    exit 1
fi

ls -lh $DIST_DIR/openzl.js
ls -lh $DIST_DIR/openzl.wasm
