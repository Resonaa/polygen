import { random, sample } from "lodash";
import { Vector3 } from "three";
import type { Face, GM } from "../gm";

import type { GMConfig } from "./common";

export function generateRandomGM({ mode, players }: GMConfig): GM {
  const faces: Face[] = [];

  for (let i = 0; i < 100; i++) {
    const normal = new Vector3().randomDirection();

    faces.push({
      position: [random(0, 50) * 20, random(0, 30) * 20, random(0, 50) * 20],
      normal: normal.toArray(),
      color: random(0, players),
      amount: 10 ** random(0, 9) * random(1, 9),
      type: random(0, 8),
      sides: sample([3, 4, 6]),
      radius: 1
    });
  }

  return {
    mode,
    edges: [],
    faces
  };

  // const map = new Map(mode);
  // const size = Math.sqrt(players * 40) | 0;
  // const noise2D = createNoise2D();
  // const height = Matrix.default(size, size, 0);
  // const quality = 20;
  // for (let i = 1; i <= size; i++) {
  //   for (let j = 1; j <= size; j++) {
  //     height.set([i, j], Math.abs(noise2D(i / quality, j / quality) * 10) | 0);
  //   }
  // }
  // for (let i = 1; i <= size; i++) {
  //   for (let j = 1; j <= size; j++) {
  //     const pos = new THREE.Vector2(i, j);
  //     const maxH = height.get([i, j]);
  //     let minH = maxH;
  //     for (const d of map.dir(pos)) {
  //       const newPos = d.add(pos);
  //       if (
  //         newPos.x >= 1 &&
  //         newPos.x <= size &&
  //         newPos.y >= 1 &&
  //         newPos.y <= size
  //       ) {
  //         minH = Math.max(minH, height.get(newPos.toArray()));
  //       }
  //     }
  //     for (let yIndex = Math.min(minH + 1, maxH); yIndex <= maxH; yIndex++) {
  //       for (let dir = yIndex === maxH ? -1 : 0; dir < Map.Sides[mode]; dir++) {
  //         map.push({
  //           pos,
  //           yIndex,
  //           dir,
  //           color: _.random(0, players),
  //           amount: _.random(1, 9) * Math.pow(10, _.random(0, 5)),
  //           id: 0,
  //         });
  //       }
  //     }
  //   }
  // }
  // map.calculatePosIndex();
  // for (let id = 0; id < map.length; id++) {
  //   const face = map[id];
  //   // Keep top faces.
  //   if (face.dir < 0) {
  //     continue;
  //   }
  //   // Delete overlapping side faces.
  //   {
  //     const newPos = map.dir(face.pos)[face.dir].add(face.pos);
  //     const block = { yIndex: face.yIndex, pos: newPos };
  //     const nextFaces = map.facesOnBlock(block);
  //     if (nextFaces.length > 0) {
  //       map.splice(id, 1);
  //       id--;
  //       continue;
  //     }
  //   }
  //   // Delete side faces that are connected to only one top face.
  //   {
  //     const newPos = map.dir(face.pos)[face.dir].add(face.pos);
  //     let shouldDelete = true;
  //     for (let yIndex = face.yIndex - 1; yIndex >= 0; yIndex--) {
  //       const block = { yIndex: face.yIndex - 1, pos: newPos };
  //       const nextFaces = map.facesOnBlock(block);
  //       if (nextFaces.length > 0) {
  //         shouldDelete = false;
  //         break;
  //       }
  //     }
  //     if (shouldDelete) {
  //       map.splice(id, 1);
  //       id--;
  //       continue;
  //     }
  //   }
  // }
  // map.calculateFaceId();
  // console.log(players, map.length);
  // return map;
}
