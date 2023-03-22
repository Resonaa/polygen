import { Map } from "../server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { colors, SpecialColor } from "~/core/client/colors";
import { formatLargeNumber } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";
import { getNeighbours } from "~/core/server/game/utils";

import * as PIXI from "pixi.js";

export class Renderer {
  gm: Map = new Map();

  private app: PIXI.Application;
  private readonly graphics: PIXI.Graphics = new PIXI.Graphics();

  private readonly textures = [undefined, PIXI.Texture.from("/images/general.png"),
    PIXI.Texture.from("/images/city.png"),
    PIXI.Texture.from("/images/mountain.png"),
    PIXI.Texture.from("/images/obstacle.png")];

  selected: Pos | null = null;
  private hovered: Pos | null = null;

  private hexagonWidth: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  private images: PIXI.Sprite[][] = [[]];
  private texts: PIXI.Text[][] = [[]];
  private hitAreas: PIXI.Sprite[][] = [[]];

  private scale = 1;
  private deltaX = 0;
  private deltaY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      antialias: true,
      view: canvas,
      height: canvas.clientHeight,
      width: canvas.clientWidth
    });

    this.app.stage.addChild(this.graphics);

    canvas.onwheel = event => {
      this.scale += event.deltaY * -0.002;
      this.scale = Math.min(Math.max(0.125, this.scale), 4);

      this.redraw();
    };

    canvas.onmousedown = event => {
      const startX = event.pageX, startY = event.pageY;
      const initialDeltaX = this.deltaX, initialDeltaY = this.deltaY;

      canvas.onmousemove = event => {
        const newDeltaX = event.pageX - startX, newDeltaY = event.pageY - startY;

        if (Math.abs(newDeltaX) <= 10 && Math.abs(newDeltaY) <= 10) {
          return;
        }

        this.deltaX = initialDeltaX + newDeltaX;
        this.deltaY = initialDeltaY + newDeltaY;

        this.redraw();
      };

      canvas.onmouseup = () => {
        canvas.onmousemove = canvas.onmouseup = null;
      };
    };
  }

  private resize() {
    const width = this.app.view.width, height = this.app.view.height;

    const maxXWidth = width / (this.gm.size + 0.5);
    const maxYWidth = height / (1 + (this.gm.size - 1) * 0.75) / (2 / Math.sqrt(3));
    this.hexagonWidth = Math.min(maxXWidth, maxYWidth) * this.scale;

    const realWidth = this.hexagonWidth * (this.gm.size + 0.5),
      realHeight = 2 / Math.sqrt(3) * this.hexagonWidth * (1 + (this.gm.size - 1) * 0.75);

    this.startX = (width - realWidth) / 2 + this.deltaX;
    this.startY = (height - realHeight) / 2 + this.deltaY;
  }

  private getHexagonUpperLeftPos([i, j]: Pos) {
    const upperLeftX = this.startX + (j - 1) * this.hexagonWidth + (i % 2 === 0 ? this.hexagonWidth / 2 : 0);
    const upperLeftY = this.startY + (i - 1) * 0.75 * 2 / Math.sqrt(3) * this.hexagonWidth;

    return [upperLeftX, upperLeftY];
  }

  private getHexagonPath(pos: Pos) {
    const [upperLeftX, upperLeftY] = this.getHexagonUpperLeftPos(pos), hexagonWidth = this.hexagonWidth;

    return [upperLeftX, upperLeftY + hexagonWidth / 2 / Math.sqrt(3),
      upperLeftX, upperLeftY + hexagonWidth / 2 / Math.sqrt(3) + hexagonWidth / Math.sqrt(3),
      upperLeftX + hexagonWidth / 2, upperLeftY + 2 / Math.sqrt(3) * hexagonWidth,
      upperLeftX + hexagonWidth, upperLeftY + hexagonWidth / 2 / Math.sqrt(3) + hexagonWidth / Math.sqrt(3),
      upperLeftX + hexagonWidth, upperLeftY + hexagonWidth / 2 / Math.sqrt(3),
      upperLeftX + hexagonWidth / 2, upperLeftY];
  }

  private addImages() {
    for (const image of this.images.flat()) {
      this.app.stage.removeChild(image);
      image.destroy();
    }

    this.images = [[]];

    for (let i = 1; i <= this.gm.size; i++) {
      this.images.push([new PIXI.Sprite()]);

      for (let j = 1; j <= this.gm.size; j++) {
        const image = new PIXI.Sprite();
        this.images[i].push(image);
        this.app.stage.addChild(image);
      }
    }
  }

  private setImages() {
    for (let i = 1; i <= this.gm.size; i++) {
      for (let j = 1; j <= this.gm.size; j++) {
        const image = this.images[i][j];

        const [x, y] = this.getHexagonUpperLeftPos([i, j]);

        image.width = image.height = 2 / Math.sqrt(3) * this.hexagonWidth / 1.5;

        image.x = x + (this.hexagonWidth - image.width) / 2;
        image.y = y + (2 / Math.sqrt(3) * this.hexagonWidth - image.height) / 2;
      }
    }
  }

  private addTexts() {
    for (const text of this.texts.flat()) {
      this.app.stage.removeChild(text);
      text.destroy();
    }

    this.texts = [[]];

    const style = new PIXI.TextStyle({
      fontSize: 15,
      fill: SpecialColor.SelectedBorder,
      fontWeight: "bold"
    });

    for (let i = 1; i <= this.gm.size; i++) {
      this.texts.push([new PIXI.Text()]);

      for (let j = 1; j <= this.gm.size; j++) {
        const text = new PIXI.Text("", style);
        this.texts[i].push(text);
        this.app.stage.addChild(text);
      }
    }
  }

  private updateAmount([i, j]: Pos) {
    const maxWidth = this.hexagonWidth, maxHeight = 2 / Math.sqrt(3) * this.hexagonWidth;
    const amount = this.gm.get([i, j]).amount;
    const text = this.texts[i][j];

    if (amount !== 0) {
      text.text = amount;

      if (text.width > maxWidth) {
        text.text = formatLargeNumber(amount);
      }
    } else {
      text.text = formatLargeNumber(amount);
    }

    const [x, y] = this.getHexagonUpperLeftPos([i, j]);
    const width = text.width;
    const height = text.height;

    text.x = x + (maxWidth - width) / 2;
    text.y = y + (maxHeight - height) / 2;
  }

  private updateType([i, j]: Pos) {
    const texture = this.textures[this.gm.get([i, j]).type];

    if (texture) {
      this.images[i][j].texture = texture;
    }
  }

  update(pos: Pos, clean?: boolean) {
    if (!this.gm.check(pos)) {
      return;
    }

    const selected = this.selected && this.selected.join() === pos.join();
    const hovered = this.hovered && this.hovered.join() === pos.join();

    const land = this.gm.get(pos);

    let fillColor = colors[land.color];

    if (land.color === 0 && land.type === LandType.Land) {
      fillColor = SpecialColor.Empty;
    }

    const lineWidth = selected || clean ? 4 : hovered ? 2 : 1;
    const lineColor = (selected || hovered) && !clean ? SpecialColor.SelectedBorder : undefined;

    this.graphics.lineStyle(lineWidth, lineColor)
      .beginFill(fillColor)
      .drawPolygon(this.getHexagonPath(pos))
      .endFill();

    this.updateType(pos);
    this.updateAmount(pos);
  }

  updateAll() {
    for (let i = 1; i <= this.gm.size; i++) {
      for (let j = 1; j <= this.gm.size; j++) {
        this.update([i, j]);
      }
    }

    this.hovered && this.update(this.hovered);
    this.selected && this.update(this.selected);
  }

  unSelect() {
    if (!this.selected) {
      return;
    }

    const preSelected = this.selected;

    this.selected = null;

    this.update(preSelected, true);
    this.update(preSelected);

    for (let neighbour of getNeighbours(this.gm, preSelected)) {
      this.update(neighbour);
    }
  }

  private select(pos: Pos) {
    this.unSelect();
    this.selected = pos;
    this.update(pos);
  }

  unHover() {
    if (!this.hovered) {
      return;
    }

    const preHovered = this.hovered;

    this.hovered = null;
    this.update(preHovered, true);
    this.update(preHovered);

    for (let neighbour of getNeighbours(this.gm, preHovered)) {
      this.update(neighbour);
    }

    this.selected && this.update(this.selected);
  }

  private hover(pos: Pos) {
    this.unHover();

    this.hovered = pos;
    this.update(pos);

    this.selected && this.update(this.selected);
  }

  private addHitAreas() {
    for (const hitArea of this.hitAreas.flat()) {
      this.app.stage.removeChild(hitArea);
      hitArea.destroy();
    }

    this.hitAreas = [[]];

    for (let i = 1; i <= this.gm.size; i++) {
      this.hitAreas.push([new PIXI.Sprite()]);

      for (let j = 1; j <= this.gm.size; j++) {
        const hit = new PIXI.Sprite(), pos = [i, j] as Pos;

        if (this.gm.get(pos).type !== LandType.Mountain) {
          hit.cursor = "pointer";
          hit.interactive = true;
          hit.on("pointerdown", () => this.select(pos))
            .on("pointerenter", () => this.hover(pos));
        }

        this.app.stage.addChild(hit);
        this.hitAreas[i].push(hit);
      }
    }
  }

  private setHitAreas() {
    const [x, y] = this.getHexagonUpperLeftPos([1, 1]);
    let hexagon = this.getHexagonPath([1, 1]);
    for (let p = 0; p < hexagon.length; p += 2) {
      hexagon[p] -= x;
      hexagon[p + 1] -= y;
    }

    const polygon = new PIXI.Polygon(hexagon);

    for (let i = 1; i <= this.gm.size; i++) {
      for (let j = 1; j <= this.gm.size; j++) {
        const hit = this.hitAreas[i][j];

        const [x, y] = this.getHexagonUpperLeftPos([i, j]);
        hit.position.set(x, y);

        hit.hitArea = polygon;
      }
    }
  }

  bind(gm: Map) {
    this.gm = gm;

    this.addImages();
    this.addTexts();
    this.addHitAreas();

    this.selected = this.hovered = null;
    this.scale = 1;
    this.deltaX = this.deltaY = 0;

    this.redraw();
  }

  redraw() {
    this.resize();

    this.setImages();
    this.setHitAreas();

    this.graphics.clear();
    this.updateAll();
  }
}