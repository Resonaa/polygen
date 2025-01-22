import { random, sample } from "lodash";
import { Vector3 } from "three";
import type { Face, GM } from "../gm";

import type { GMConfig } from "./common";

export function generateRandomGM({ mode, players }: GMConfig): GM {
  const faces: Face[] = [];

  for (let i = 0; i < 2500; i++) {
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
    edges: [],
    faces
  };
}
