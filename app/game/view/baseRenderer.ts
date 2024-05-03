import _ from "lodash";
import type { PointData } from "pixi.js";
import {
  Texture,
  BitmapText,
  BitmapFont,
  Application,
  Graphics,
  Sprite,
  Polygon,
  Container,
  Assets
} from "pixi.js";

import city from "@/static/city.png";
import crown from "@/static/crown.png";
import mountain from "@/static/mountain.png";
import obstacle from "@/static/obstacle.png";
import swamp from "@/static/swamp.png";

import type { Gm } from "../gm/gm";
import { Land } from "../gm/land";
import type { Pos } from "../gm/matrix";
import { Matrix } from "../gm/matrix";

import {
  BORDER_COLOR,
  DELTA_SCALE_PER_ZOOM,
  EMPTY_COLOR,
  MAX_SCALE,
  MIN_DELTA_POS,
  MIN_SCALE,
  MIN_TEXT_SIZE,
  MOBILE_MOVE_RATE,
  MOBILE_ZOOM_RATE,
  MOUNTAIN_COLOR,
  R,
  STANDARD_COLOR,
  TEXT_COLOR,
  TEXT_SIZE,
  UNKNOWN_COLOR
} from "./constants";
import { formatLargeNumber } from "./utils";

/**
 * Basic renderer without mode support and interaction.
 */
export default abstract class BaseRenderer {
  textures: Texture[] = [];

  app = new Application();
  graphics = new Graphics();
  gm: Gm;

  /**
   * Land types.
   */
  images = new Matrix<Sprite>();

  imageContainer = new Container({
    isRenderGroup: true
  });

  /**
   * Land amounts.
   */
  texts = new Matrix<BitmapText>();

  textContainer = new Container({
    isRenderGroup: true
  });

  /**
   * Land hit areas.
   */
  hitAreas = new Matrix<Sprite>();

  hitAreaContainer = new Container({
    isRenderGroup: true
  });

  /**
   * Currently selected position.
   */
  selected?: Pos;

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

    this.textures = [
      Texture.EMPTY,
      await Assets.load(crown),
      await Assets.load(city),
      await Assets.load(mountain),
      await Assets.load(obstacle),
      Texture.EMPTY,
      await Assets.load(swamp),
      await Assets.load(swamp)
    ];

    BitmapFont.install({
      style: {
        fontWeight: "500",
        fontSize: TEXT_SIZE * 1.5,
        fill: TEXT_COLOR,
        fontFamily: "Noto Sans SC Variable"
      },
      name: "text",
      chars: [["0", "9"], "kme.- "]
    });

    let deltaScale = 0,
      deltaX = 0,
      deltaY = 0;

    // Zoom support.
    canvas.onwheel = event => {
      event.preventDefault();
      deltaScale +=
        event.deltaY > 0 ? -DELTA_SCALE_PER_ZOOM : DELTA_SCALE_PER_ZOOM;
    };

    // Move support.
    canvas.onmousedown = event => {
      const initialPageX = event.pageX,
        initialPageY = event.pageY;

      let lastPageX = initialPageX,
        lastPageY = initialPageY;

      let shouldMove = false;

      document.onmousemove = ({ pageX, pageY }) => {
        if (
          !shouldMove &&
          (Math.abs(pageX - initialPageX) > MIN_DELTA_POS ||
            Math.abs(pageY - initialPageY) > MIN_DELTA_POS)
        ) {
          shouldMove = true;
          document.body.setAttribute("style", "user-select: none");
        }

        if (!shouldMove) {
          return;
        }

        deltaX += pageX - lastPageX;
        deltaY += pageY - lastPageY;

        lastPageX = pageX;
        lastPageY = pageY;
      };

      document.onmouseup = event => {
        event.preventDefault();
        document.body.removeAttribute("style");
        document.onmousemove = document.onmouseup = null;
      };
    };

    // Zoom and move support on mobile devices.
    canvas.ontouchstart = event => {
      // Mobile move support.
      if (event.touches.length === 1) {
        let lastPageX = event.touches[0].pageX,
          lastPageY = event.touches[0].pageY;

        const stopMove = () => {
          document.ontouchmove = document.ontouchend = null;
        };

        document.ontouchmove = event => {
          event.preventDefault();

          if (event.touches.length !== 1) {
            stopMove();
            return;
          }

          const { pageX, pageY } = event.touches[0];

          deltaX += (pageX - lastPageX) * MOBILE_MOVE_RATE;
          deltaY += (pageY - lastPageY) * MOBILE_MOVE_RATE;

          lastPageX = pageX;
          lastPageY = pageY;
        };

        document.ontouchend = event => {
          event.preventDefault();
          stopMove();
        };
      }

      // Mobile zoom & move support.
      if (event.touches.length === 2) {
        event.preventDefault();

        const [touch1, touch2] = event.touches;

        let lastDist = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
            Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        let lastMidX = (touch1.clientX + touch2.clientX) / 2;
        let lastMidY = (touch1.clientY + touch2.clientY) / 2;

        const stopZoom = () => {
          document.ontouchmove = document.ontouchend = null;
        };

        document.ontouchmove = event => {
          event.preventDefault();

          if (event.touches.length !== 2) {
            stopZoom();
            return;
          }

          const [touch1, touch2] = event.touches;

          const dist = Math.sqrt(
            Math.pow(touch1.clientX - touch2.clientX, 2) +
              Math.pow(touch1.clientY - touch2.clientY, 2)
          );
          const midX = (touch1.clientX + touch2.clientX) / 2;
          const midY = (touch1.clientY + touch2.clientY) / 2;

          deltaScale += (dist - lastDist) * MOBILE_ZOOM_RATE;
          deltaX += (midX - lastMidX) * MOBILE_MOVE_RATE;
          deltaY += (midY - lastMidY) * MOBILE_MOVE_RATE;

          lastDist = dist;
          lastMidX = midX;
          lastMidY = midY;
        };

        document.ontouchend = event => {
          event.preventDefault();
          stopZoom();
        };
      }
    };

    this.reset();

    // Handle scale and position update.
    this.app.ticker.add(({ deltaMS }) => {
      if (Math.abs(deltaScale) < 0.01) {
        deltaScale = 0;
      }

      if (Math.abs(deltaX) < 0.2) {
        deltaX = 0;
      }

      if (Math.abs(deltaY) < 0.2) {
        deltaY = 0;
      }

      if (deltaScale === 0 && deltaX === 0 && deltaY === 0) {
        return;
      }

      const updateScale = (deltaMS / 150) * deltaScale;
      deltaScale -= updateScale;

      const updateX = (deltaMS / 120) * deltaX;
      deltaX -= updateX;

      const updateY = (deltaMS / 120) * deltaY;
      deltaY -= updateY;

      const oldScale = this.app.stage.scale.x;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, oldScale + updateScale)
      );

      this.app.stage.scale.set(newScale);

      const rate = newScale / oldScale;

      const centerWidth = this.app.canvas.width / 2;
      const centerHeight = this.app.canvas.height / 2;

      this.app.stage.position.set(
        centerWidth - rate * (centerWidth - this.app.stage.x) + updateX,
        centerHeight - rate * (centerHeight - this.app.stage.y) + updateY
      );
    });
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
   * Gets the maximum size of an image. (R = 1)
   */
  abstract maxImageSize(): number;

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
    const land = this.gm.get(pos);

    let fillColor = STANDARD_COLOR[land.color];

    if (!land.visible()) {
      fillColor = UNKNOWN_COLOR;
    } else if (land.type === Land.Type.Mountain) {
      fillColor = MOUNTAIN_COLOR;
    } else if (land.type === Land.Type.Land) {
      fillColor = EMPTY_COLOR;
    }

    const selected = _.isEqual(this.selected, pos);

    const fill = this.graphics.poly(this.poly(pos)).fill(fillColor);

    if (selected) {
      fill.stroke({
        width: 3,
        color: BORDER_COLOR,
        alignment: 1
      });
    }
  }

  /**
   * Updates the text of the polygon at the given pos.
   */
  updateText(pos: Pos) {
    const text = this.texts.get(pos);
    const land = this.gm.get(pos);

    text.text = land.amount.toString();

    const maxWidth = this.maxTextWidth() * R;

    for (
      text.style.fontSize = TEXT_SIZE;
      text.width > maxWidth && text.style.fontSize >= MIN_TEXT_SIZE;
      text.style.fontSize--
    ) {
      // Adjust text size.
    }

    // Size exceeds limit even after adjustment.
    if (text.width > maxWidth) {
      text.style.fontSize = TEXT_SIZE;
      text.text = formatLargeNumber(land.amount);
    }

    const { x, y } = this.center(pos);
    const width = text.width;
    const height = text.height;

    text.position.set(x * R - width / 2, y * R - height / 2);
  }

  /**
   * Updates the image of the polygon at the given pos.
   */
  updateImage(pos: Pos) {
    const image = this.images.get(pos);
    const land = this.gm.get(pos);

    image.texture = this.textures[land.type];

    const size = this.maxImageSize() * R;
    image.width = image.height = size;

    const { x, y } = this.center(pos);
    image.position.set(x * R - size / 2, y * R - size / 2);
  }

  /**
   * Updates all polygons.
   */
  updateAll() {
    this.gm.positions().forEach(pos => {
      this.updateGraphics(pos);
    });

    this.gm.positions().forEach(pos => {
      this.updateImage(pos);
    });

    this.gm.positions().forEach(pos => {
      this.updateText(pos);
    });
  }

  /**
   * Clears the renderer.
   */
  clear() {
    // Clear selected position.
    this.selected = undefined;

    // Clear graphics.
    this.graphics.clear();

    // Remove images.
    this.imageContainer.destroy({ children: true });
    this.imageContainer = new Container({ isRenderGroup: true });
    this.app.stage.addChild(this.imageContainer);

    // Remove texts.
    this.textContainer.destroy(true);
    this.textContainer = new Container({ isRenderGroup: true });
    this.textContainer.interactiveChildren = false;
    this.textContainer.eventMode = "none";
    this.app.stage.addChild(this.textContainer);

    // Remove hit areas.
    this.hitAreaContainer.destroy(true);
    this.hitAreaContainer = new Container({ isRenderGroup: true });
    this.app.stage.addChild(this.hitAreaContainer);
  }

  /**
   * Resets the renderer to its initial state.
   */
  reset() {
    this.clear();

    // Add images.
    this.images = Matrix.defaultWith(this.gm.height, this.gm.width, () => {
      const image = new Sprite();
      image.interactiveChildren = false;
      image.eventMode = "none";
      this.imageContainer.addChild(image);
      return image;
    });

    // Add texts.
    this.texts = Matrix.defaultWith(this.gm.height, this.gm.width, () => {
      const text = new BitmapText({
        text: "",
        style: { fontFamily: "text", fontSize: TEXT_SIZE }
      });
      text.interactiveChildren = false;
      text.eventMode = "none";
      this.textContainer.addChild(text);
      return text;
    });

    // Add hit areas.
    this.hitAreas = Matrix.defaultWith(
      this.gm.height,
      this.gm.width,
      () => new Sprite()
    );

    for (const pos of this.hitAreas.positions()) {
      const hitArea = this.hitAreas.get(pos);
      hitArea.interactiveChildren = false;

      const { x, y } = this.topLeft(pos);
      hitArea.position.set(x * R, y * R);

      hitArea.hitArea = new Polygon(
        this.shape(pos).map(({ x, y }) => ({ x: x * R, y: y * R }))
      );

      this.hitAreaContainer.addChild(hitArea);

      hitArea.eventMode = "static";
    }

    // Redraw everything.
    this.updateAll();
  }
}
