export { hash } from "wasm";

/**
 * Hashes the given data. Only for benchmarking.
 */
export function hashJs(data: Uint8Array) {
  let hash = 0x811c9dc5;

  data.forEach(i => {
    hash ^= i;
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });

  return hash >>> 0;
}
