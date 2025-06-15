import LZString from "lz-string";
import type { PartialDeep } from "type-fest";

import { merge as deepMerge } from "./utils";

export type Type = typeof Default;

const KEY = "settings";

export const Default = {
  game: {
    view: {
      antialias: true,
      camera: {
        far: 1200,
        fov: 60,
        near: 1
      },
      controls: {
        dampingFactor: 0.2,
        maxDistance: 1000,
        minDistance: 200,
        panSpeed: 1.1,
        rotateSpeed: 0.8,
        zoomSpeed: 2.1
      },
      map: {
        imageSize: 20,
        maxTextSize: 7,
        minTextSize: 1,
        radius: 20
      }
    }
  }
};

/**
 * Merges partial settings into complete settings.
 */
function merge(partial: PartialDeep<Type>) {
  return deepMerge<Type>(Default, partial);
}

/**
 * Loads settings from LocalStorage.
 */
export function load() {
  const s = localStorage.getItem(KEY) ?? "";

  // Try to use the settings from LocalStorage.
  try {
    const partial = JSON.parse(
      LZString.decompressFromUTF16(s)
    ) as PartialDeep<Type>;

    return merge(partial);
  } catch {
    save(Default);
    return Default;
  }
}

/**
 * Saves settings to LocalStorage.
 */
export function save(settings: PartialDeep<Type>) {
  localStorage.setItem(KEY, LZString.compressToUTF16(JSON.stringify(settings)));
}
