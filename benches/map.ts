import { memory, Map, Mode } from "~/wasm/server";
import { readMap } from "~/wasm/utils";

const width = 255,
  height = 255,
  mode = Mode.Hexagon;

const map = new Map(mode, width, height);

const lands = readMap(memory, map);

console.log(lands);

console.log(map.neighbors(425));
