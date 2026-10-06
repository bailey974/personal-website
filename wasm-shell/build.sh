#!/usr/bin/env bash
# Compiles customshell_wasm.c to WebAssembly for the site's "Run" tab.
# Requires the Emscripten SDK (emcc) on PATH — see https://emscripten.org/docs/getting_started/downloads.html
# Re-run this whenever customshell_wasm.c changes.
set -euo pipefail
cd "$(dirname "$0")"

OUT_DIR="../public/wasm"
mkdir -p "$OUT_DIR"

emcc customshell_wasm.c -O2 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXPORT_NAME=createShellModule \
  -s EXPORTED_FUNCTIONS=_shell_init,_shell_run_line,_shell_get_prompt \
  -s EXPORTED_RUNTIME_METHODS=ccall,cwrap \
  -s ENVIRONMENT=web \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s FILESYSTEM=1 \
  -s INVOKE_RUN=0 \
  -s EXIT_RUNTIME=0 \
  -o "$OUT_DIR/shell.js"

echo "Built $OUT_DIR/shell.js + shell.wasm"
