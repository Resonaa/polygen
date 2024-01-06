import { Bench } from "tinybench";

import { Map as NodeMap, MapMode as NodeMode } from "~/core/server/map/map";
import { Map, Mode } from "~/wasm/server";

(async () => {
  const bench = new Bench();

  for (const size of [20, 50, 100]) {
    bench.add(`Node init map ${size}*${size}`, () => {
      new NodeMap(size, size, NodeMode.Hexagon);
    });

    bench.add(`WASM init map ${size}*${size}`, () => {
      new Map(Mode.Hexagon, size, size).free();
    });
  }

  await bench.warmup();
  await bench.run();

  console.table(bench.table());
})();
