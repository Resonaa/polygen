import { getRandomValues } from "node:crypto";

import { Bench } from "tinybench";

import { hash } from "~/wasm/server";

/**
 * Hashes the given data. Only for benchmarking.
 */
function hashJs(data: Uint8Array) {
  let hash = 0x811c9dc5;

  data.forEach(i => {
    hash ^= i;
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  });

  return hash >>> 0;
}

const bench = new Bench({
  time: 3000
});

const data = new Uint8Array(65536);

const genData = () => {
  getRandomValues(data);
};

bench.add("Node hash", () => hashJs(data), {
  beforeEach: genData
});

bench.add("WASM hash", () => hash(data), {
  beforeEach: genData
});

await bench.warmup();
await bench.run();

console.table(bench.table());
