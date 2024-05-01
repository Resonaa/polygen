import { Gm } from "../gm/gm";
import type { Pos } from "../gm/matrix";

import BaseRenderer from "./baseRenderer";

/**
 * Full-featured renderer with mode support.
 */
export default class Renderer extends BaseRenderer {
  constructor(gm: Gm) {
    super(gm);
  }

  shape([i, j]: Pos) {
    switch (this.gm.mode) {
      case Gm.Mode.Hexagon: {
        return [
          { x: 0.5, y: 0 },
          { x: 1.5, y: 0 },
          { x: 2, y: Math.sqrt(3) / 2 },
          { x: 1.5, y: Math.sqrt(3) },
          { x: 0.5, y: Math.sqrt(3) },
          { x: 0, y: Math.sqrt(3) / 2 }
        ];
      }
      case Gm.Mode.Square: {
        return [
          { x: 0, y: 0 },
          { x: Math.sqrt(2), y: 0 },
          { x: Math.sqrt(2), y: Math.sqrt(2) },
          { x: 0, y: Math.sqrt(2) }
        ];
      }
      case Gm.Mode.Triangle: {
        return (i + j) % 2 === 0
          ? [
              { x: Math.sqrt(3) / 2, y: 0 },
              { x: Math.sqrt(3), y: 1.5 },
              { x: 0, y: 1.5 }
            ]
          : [
              { x: 0, y: 0 },
              { x: Math.sqrt(3), y: 0 },
              { x: Math.sqrt(3) / 2, y: 1.5 }
            ];
      }
    }
  }

  topLeft([i, j]: Pos) {
    switch (this.gm.mode) {
      case Gm.Mode.Hexagon: {
        return {
          x: (j - 1) * 1.5 * this.radius,
          y:
            j % 2 === 0
              ? (Math.sqrt(3) / 2 + (i - 1) * Math.sqrt(3)) * this.radius
              : (i - 1) * Math.sqrt(3) * this.radius
        };
      }
      case Gm.Mode.Square: {
        return {
          x: (j - 1) * Math.sqrt(2) * this.radius,
          y: (i - 1) * Math.sqrt(2) * this.radius
        };
      }
      case Gm.Mode.Triangle: {
        return {
          x: (Math.sqrt(3) / 2) * (j - 1) * this.radius,
          y: 1.5 * (i - 1) * this.radius
        };
      }
    }
  }
}
