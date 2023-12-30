import { getRandomValues } from "node:crypto";

import { Bench } from "tinybench";

import { hashJs, hash } from "~/hash.server";

(async () => {
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
})();
