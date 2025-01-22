import { createNoise2D } from "simplex-noise";
import { Vector2 } from "three/webgpu";
import { GM } from "../gm";
import { type Face2D, dir } from "./2d";
import type { GMConfig } from "./common";
import { playersToSize } from "./constants";

const QUALITY = 20;

function hashFace2D({ yIndex, pos }: Pick<Face2D, "yIndex" | "pos">) {
  return `${pos.toArray()},${yIndex}`;
}

export function span({ players, mode }: GMConfig) {
  const size = playersToSize(players);
  const noise2D = createNoise2D();
  const height: number[][] = new Array(size);

  const faces2D: Face2D[] = [];

  for (let i = 0; i < size; i++) {
    height[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      height[i][j] = Math.abs(noise2D(i / QUALITY, j / QUALITY) * 10) >>> 0;
    }
  }

  const facesOnBlock = new Set<string>();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const pos = new Vector2(i, j);
      const maxH = height[i][j];
      let minH = maxH;

      const dirs = dir(mode, pos);

      for (const d of dirs) {
        const newPos = d.add(pos);
        if (
          newPos.x > 0 &&
          newPos.x < size &&
          newPos.y > 0 &&
          newPos.y < size
        ) {
          minH = Math.max(minH, height[newPos.x][newPos.y]);
        }
      }

      for (let yIndex = Math.min(minH + 1, maxH); yIndex <= maxH; yIndex++) {
        for (let dir = yIndex === maxH ? -1 : 0; dir < dirs.length; dir++) {
          const face = {
            pos,
            yIndex,
            dir
          };
          faces2D.push(face);
          facesOnBlock.add(hashFace2D(face));
        }
      }
    }
  }

  for (let i = 0; i < faces2D.length; i++) {
    const face = faces2D[i];

    // Keep top faces.
    if (face.dir < 0) {
      continue;
    }

    // Delete overlapping side faces.
    {
      const newPos = dir(mode, face.pos)[face.dir].add(face.pos);
      const block = { yIndex: face.yIndex, pos: newPos };
      if (facesOnBlock.has(hashFace2D(block))) {
        faces2D.splice(i, 1);
        i--;
        continue;
      }
    }

    // Delete side faces that are connected to only one top face.
    {
      const newPos = dir(mode, face.pos)[face.dir].add(face.pos);
      let shouldDelete = true;
      for (let yIndex = face.yIndex - 1; yIndex >= 0; yIndex--) {
        const block = { yIndex: face.yIndex - 1, pos: newPos };
        if (facesOnBlock.has(hashFace2D(block))) {
          shouldDelete = false;
          break;
        }
      }

      if (shouldDelete) {
        faces2D.splice(i, 1);
        i--;
      }
    }
  }

  map.calculateFaceId();
  console.log(players, map.length);
  return map;
}
