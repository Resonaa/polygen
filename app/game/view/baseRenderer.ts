import _ from "lodash";
import type { PointData } from "pixi.js";
import { Application, Graphics } from "pixi.js";

import type { Gm } from "../gm/gm";
import type { Pos } from "../gm/matrix";

const DEFAULT_RADIUS = 25;

/**
 * Basic renderer without mode support.
 */
export default abstract class BaseRenderer {
  app = new Application();
  graphics = new Graphics();
  gm: Gm;

  /**
   * Radius of the circumscribed circle of a polygon.
   */
  radius: number = DEFAULT_RADIUS;

  protected constructor(gm: Gm) {
    this.gm = gm;
  }

  /**
   * Initializes the Renderer with the given canvas.
   */
  async init(canvas: HTMLCanvasElement) {
    await this.app.init({
      antialias: true,
      powerPreference: "high-performance",
      canvas,
      height: canvas.parentElement?.clientHeight,
      width: canvas.parentElement?.clientWidth
    });

    this.app.stage.addChild(this.graphics);
  }

  /**
   * Gets the base shape of the polygon at the given pos. (radius = 1)
   */
  abstract shape(pos: Pos): PointData[];

  /**
   * Gets the top-left position of the polygon at the given pos.
   */
  abstract topLeft(pos: Pos): PointData;

  /**
   * Gets the piles of the polygon at the given pos.
   */
  poly(pos: Pos): PointData[] {
    const { x: startX, y: startY } = this.topLeft(pos);

    return this.shape(pos).map(({ x, y }) => ({
      x: x * this.radius + startX,
      y: y * this.radius + startY
    }));
  }

  /**
   * Updates the graphics of the polygon at the given pos.
   */
  updateGraphics(pos: Pos) {
    const fillColor = _.random(0, 0xffffff);
    const borderColor = 0xffffff;
    const lineWidth = 1;

    this.graphics.poly(this.poly(pos)).fill(fillColor).stroke({
      width: lineWidth,
      color: borderColor
    });
  }

  /**
   * Updates the graphics of all polygons.
   */
  updateGraphicsAll() {
    this.gm.positions().forEach(pos => this.updateGraphics(pos));
  }
}
