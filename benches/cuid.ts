import { Bench } from "tinybench";

import { cuid } from "~/models/cuid.server";

const bench = new Bench({
  time: 3000
});

bench.add("Node CUID", () => cuid());

await bench.warmup();
await bench.run();

console.table(bench.table());
