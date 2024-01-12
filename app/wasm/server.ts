import { __wasm } from "wasm-server";

declare module "wasm-server" {
  /**
   * Raw handle to the underlying WebAssembly instance.
   */
  const __wasm: {
    memory: WebAssembly.Memory;
  };
}

export const memory = __wasm.memory;

export * from "wasm-server";
