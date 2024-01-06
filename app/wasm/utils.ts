import type { Map } from "./server";

/**
 * Commons between server and client map.
 */
type MapLike = Pick<Map, "export_lands" | "size">;

/**
 * Size of each land.
 */
const LAND_SIZE = 6;

/**
 * Reads the lands of the map.
 */
export function readMap(memory: WebAssembly.Memory, map: MapLike) {
  const ptr = map.export_lands();

  const offset = map.size * LAND_SIZE;

  return new Uint8Array(memory.buffer, ptr, offset);
}
