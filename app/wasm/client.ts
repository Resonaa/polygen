import __wbg_init from "../../wasm/client/wasm";
import wasm from "../../wasm/client/wasm_bg.wasm";

/**
 * Memory of the underlying WebAssembly instance.
 */
export let memory: WebAssembly.Memory;

/**
 * Whether the WebAssembly module is initiated.
 */
export let isInit = false;

/**
 * Inits client-side WebAssembly module.
 */
async function initWasm() {
  if (isInit) {
    return;
  }

  isInit = true;

  const instance = await __wbg_init(wasm);
  memory = instance.memory;
}

export default initWasm;

export * from "../../wasm/client/wasm";
