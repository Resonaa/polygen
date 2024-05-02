import _ from "lodash";
import type { PointData } from "pixi.js";
import { BitmapText, BitmapFont, Application, Graphics } from "pixi.js";

import type { Gm } from "../gm/gm";
import type { Pos } from "../gm/matrix";
import { Matrix } from "../gm/matrix";

import { R, TEXT_COLOR, TEXT_SIZE } from "./constants";
import { formatLargeNumber } from "./utils";

/**
 * Basic renderer without mode support.
 */
export default abstract class BaseRenderer {
  app = new Application();
  graphics = new Graphics();
  gm: Gm;

  /**
   * Land amounts.
   */
  texts = new Matrix<BitmapText>();

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

    BitmapFont.install({
      style: {
        fontWeight: "bold",
        fontSize: TEXT_SIZE,
        fill: TEXT_COLOR
      },
      name: "text",
      chars: [["0", "9"], "kme.- "]
    });

    // Zoom support.
    canvas.onwheel = event => {
      event.preventDefault();

      const oldScale = this.app.stage.scale.x;
      const newScale = oldScale + (event.deltaY > 0 ? -0.1 : 0.1);

      if (newScale >= 0.5 && newScale <= 2) {
        this.app.stage.scale.set(newScale);

        const rate = newScale / oldScale;

        const width = this.app.canvas.width,
          height = this.app.canvas.height;

        this.app.stage.x = width / 2 - rate * (width / 2 - this.app.stage.x);
        this.app.stage.y = height / 2 - rate * (height / 2 - this.app.stage.y);
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

    this.reset();
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
   * Gets the center position of the polygon at the given pos. (R = 1)
   */
  abstract center(pos: Pos): PointData;

  /**
   * Gets the maximum width of a text. (R = 1)
   */
  abstract maxTextWidth(): number;

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
   * Updates the text of the polygon at the given pos.
   */
  updateText(pos: Pos) {
    const text = this.texts.get(pos);
    const land = this.gm.get(pos);

    text.text = land.amount.toString();

    const maxWidth = this.maxTextWidth() * R;

    if (text.width > maxWidth) {
      text.text = formatLargeNumber(land.amount);
    }

    const { x, y } = this.center(pos);
    const width = text.width;
    const height = text.height;

    text.x = x * R - width / 2;
    text.y = y * R - height / 2;
  }

  /**
   * Updates all polygons.
   */
  updateAll() {
    this.gm.positions().forEach(pos => {
      this.updateGraphics(pos);
      this.updateText(pos);
    });
  }

  /**
   * Resets the renderer to its initial state.
   */
  reset() {
    // Clear graphics.
    this.graphics.clear();

    // Remove texts.
    for (const text of this.texts.flat()) {
      this.app.stage.removeChild(text);
      text.destroy();
    }

    // Add texts.
    this.texts = Matrix.defaultWith(
      this.gm.height,
      this.gm.width,
      () =>
        new BitmapText({
          text: "",
          style: { fontFamily: "text", fontSize: TEXT_SIZE }
        })
    );

    for (const text of this.texts.flat()) {
      this.app.stage.addChild(text);
    }

    // Redraw everything.
    this.updateAll();
  }
}
