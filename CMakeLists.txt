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
target_link_libraries(openzl-wasm PRIVATE openzl)
target_compile_options(openzl-wasm PRIVATE -Oz)

# 6. Emscripten specific settings
set_target_properties(openzl-wasm PROPERTIES
    OUTPUT_NAME "openzl"
    SUFFIX ".js"
    LINK_FLAGS "--bind -Oz -flto -s WASM=1 -s MODULARIZE=1 -s EXPORT_ES6=1 -s FILESYSTEM=0 -s EXIT_RUNTIME=0 -s ALLOW_MEMORY_GROWTH=1"
)
