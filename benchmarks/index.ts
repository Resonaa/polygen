import { Bench } from "tinybench";

import { generateMap } from "~/core/server/game/generator";
import { MapMode } from "~/core/server/game/map";
import { RoomMap } from "~/core/server/vote";

(async () => {
  const bench = new Bench();

  for (const map of Object.values(RoomMap)) {
    bench.add(`generate ${map}`, () => generateMap(12, MapMode.Hexagon, map));
  }

  await bench.warmup();
  await bench.run();

  console.table(bench.table());
})();
