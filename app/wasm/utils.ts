import type { Map } from "./server";

/**
 * Commons between server and client map.
 */
type MapLike = Pick<Map, "export_lands" | "size">;

/**
 * Reads the lands of the map.
 */
export function readMap(memory: WebAssembly.Memory, map: MapLike) {
  const ptr = map.export_lands();
  const offset = map.size;
  return new Uint32Array(memory.buffer, ptr, offset);
}
