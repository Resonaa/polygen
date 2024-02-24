import { Bench } from "tinybench";

import { Map, MapMode } from "~/core/server/map/map";

const bench = new Bench();

for (const size of [20, 50, 100]) {
  bench.add(`init map ${size}*${size}`, () => {
    new Map(size, size, MapMode.Hexagon);
  });
}

await bench.warmup();
await bench.run();

console.table(bench.table());
