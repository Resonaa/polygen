import { Vector2 } from "three/webgpu";
import { GMMode } from "./common";

export interface Face2D {
  pos: Vector2;
  dir: number;
  yIndex: number;
}

/**
 * Returns the dir array of the given pos.
 */
export function dir(mode: GMMode, { x, y }: Vector2): Vector2[] {
  return (() => {
    switch (mode) {
      case GMMode.Hexagon: {
        return y % 2 === 1
          ? [
              [-1, -1],
              [-1, 0],
              [-1, 1],
              [0, 1],
              [1, 0],
              [0, -1]
            ]
          : [
              [0, -1],
              [-1, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [1, -1]
            ];
      }
      case GMMode.Square: {
        return [
          [-1, 0],
          [0, -1],
          [1, 0],
          [0, 1]
        ];
      }
      case GMMode.Triangle: {
        return (x + y) % 2 === 0
          ? [
              [1, 0],
              [0, -1],
              [0, 1]
            ]
          : [
              [-1, 0],
              [0, -1],
              [0, 1]
            ];
      }
    }
  })().map(([x, y]) => new Vector2(x, y));
}
