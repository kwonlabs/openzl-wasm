cmake_minimum_required(VERSION 3.20)
project(openzl-wasm)

# 1. Emscripten Check
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "This project must be compiled with Emscripten (use emcmake).")
endif()

# 2. OpenZL Configuration
set(OPENZL_DIR "${CMAKE_CURRENT_SOURCE_DIR}/vendor/OpenZL")
add_subdirectory(${OPENZL_DIR} EXCLUDE_FROM_ALL)

# 3. WASM Target
add_executable(openzl-wasm src/bindings.cpp)

# 4. Include Directories
target_include_directories(openzl-wasm PRIVATE 
    ${OPENZL_DIR}/include
    ${OPENZL_DIR}/src
)

# 5. Link Libraries
# OpenZL libraries (adjust based on actual lib names in vendor/OpenZL)
target_link_libraries(openzl-wasm PRIVATE openzl)

# 6. Emscripten specific settings
set_target_properties(openzl-wasm PROPERTIES
    SUFFIX ".js"
    LINK_FLAGS "--bind -s WASM=1 -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] -s MODULARIZE=1 -s EXPORT_ES6=1"
)
