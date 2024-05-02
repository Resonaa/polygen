import _ from "lodash";
import type { PointData } from "pixi.js";
import { Application, Graphics } from "pixi.js";

import type { Gm } from "../gm/gm";
import type { Pos } from "../gm/matrix";

import { R } from "./constants";

/**
 * Basic renderer without mode support.
 */
export default abstract class BaseRenderer {
  app = new Application();
  graphics = new Graphics();
  gm: Gm;

  protected constructor(gm: Gm) {
    this.gm = gm;
  }

  /**
   * Initializes the Renderer with the given canvas.
   */
  async init(canvas: HTMLCanvasElement) {
    const height = canvas.parentElement?.clientHeight;
    const width = canvas.parentElement?.clientWidth;

    await this.app.init({
      antialias: true,
      powerPreference: "high-performance",
      canvas,
      height,
      width
    });

    this.app.stage.addChild(this.graphics);

    // Zoom support.
    canvas.onwheel = event => {
      event.preventDefault();

      const newScale = this.app.stage.scale.x + (event.deltaY > 0 ? -0.1 : 0.1);

      if (newScale >= 0.5 && newScale <= 2) {
        this.app.stage.scale.set(newScale);
      }
    };

    // Move support.
    canvas.onpointerdown = event => {
      const startX = event.pageX,
        startY = event.pageY;

      const initialStartX = this.app.stage.x,
        initialStartY = this.app.stage.y;

      let flag = false;

      document.onpointermove = event => {
        const deltaX = event.pageX - startX;
        const deltaY = event.pageY - startY;

        if (!flag && (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20)) {
          flag = true;
          document.body.setAttribute("style", "user-select: none");
        }

        if (!flag) {
          return;
        }

        this.app.stage.x = initialStartX + deltaX;
        this.app.stage.y = initialStartY + deltaY;
      };

      document.onpointerup = event => {
        event.preventDefault();
        document.body.removeAttribute("style");
        document.onpointermove = document.onpointerup = null;
      };
    };
  }

  /**
   * Gets the base shape of the polygon at the given pos. (R = 1)
   */
  abstract shape(pos: Pos): PointData[];

  /**
   * Gets the top-left position of the polygon at the given pos. (R = 1)
   */
  abstract topLeft(pos: Pos): PointData;

  /**
   * Destroys the renderer and its resources.
   */
  destroy() {
    this.app.destroy(false, true);
  }

  /**
   * Gets the piles of the polygon at the given pos.
   */
  poly(pos: Pos): PointData[] {
    const { x: startX, y: startY } = this.topLeft(pos);

    return this.shape(pos).map(({ x, y }) => ({
      x: (x + startX) * R,
      y: (y + startY) * R
    }));
  }

  /**
   * Updates the graphics of the polygon at the given pos.
   */
  updateGraphics(pos: Pos) {
    const fillColor = _.random(0, 0xffffff);

    this.graphics.poly(this.poly(pos)).fill(fillColor);
  }

  /**
   * Updates the graphics of all polygons.
   */
  updateGraphicsAll() {
    this.gm.positions().forEach(pos => this.updateGraphics(pos));
  }
}
