import _ from "lodash";

import { Land } from "./land";
import { Matrix } from "./matrix";
import type { Pos } from "./matrix";

/**
 * Gm extended from a Matrix of Lands, which knows its mode and
 * supports some mode-related methods.
 */
export class Gm extends Matrix<Land> {
  /**
   * Gm modes.
   */
  static Mode = {
    Hexagon: "Hexagon",
    Square: "Square",
    Triangle: "Triangle"
  } as const;

  /**
   * Gm mode.
   */
  mode: keyof typeof Gm.Mode;

  /**
   * Creates a shared Matrix of Lands from Gm.
   */
  downgrade() {
    return Matrix.from(this);
  }

  /**
   * Creates a Gm with given mode and lands.
   */
  constructor(mode: Gm["mode"], lands: Land[][]) {
    super(...lands);
    this.mode = mode;
  }

  /**
   * Creates a Gm from JSON value.
   */
  static fromJSON({ lands, mode }: { lands: Land[][]; mode: Gm["mode"] }) {
    return new this(mode, lands);
  }

  /**
   * Creates an empty gm with given height and width.
   */
  static empty(mode: Gm["mode"], height: number, width: number) {
    return new this(mode, Matrix.default(height, width, new Land()));
  }

  /**
   * Creates a random gm with given height and width.
   */
  static random(mode: Gm["mode"], height: number, width: number) {
    return new this(
      mode,
      Matrix.defaultWith(
        height,
        width,
        () =>
          new Land(
            _.random(0, 20),
            _.sample(Object.values(Land.Type))!,
            _.random(1, 9) * Math.pow(10, _.random(0, 6))
          )
      )
    );
  }

  /**
   * Exports the Gm to JSON.
   */
  toJSON() {
    return {
      mode: this.mode,
      lands: this.downgrade()
    };
  }

  /**
   * Returns the dir array of the given pos.
   */
  dir([x, y]: Pos): [number, number][] {
    switch (this.mode) {
      case Gm.Mode.Hexagon: {
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
      case Gm.Mode.Square: {
        return [
          [-1, 0],
          [0, -1],
          [1, 0],
          [0, 1]
        ];
      }
      case Gm.Mode.Triangle: {
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
  }

  /**
   * Returns all neighbors of the given pos.
   */
  neighbors([x, y]: Pos): Pos[] {
    return this.dir([x, y])
      .map(([dx, dy]) => [x + dx, y + dy] as Pos)
      .filter(pos => this.check(pos));
  }
}
