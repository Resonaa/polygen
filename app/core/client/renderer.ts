import * as PIXI from "pixi.js";

import { colors, SpecialColor } from "~/core/client/colors";
import { getSettings } from "~/core/client/settings";
import { formatLargeNumber } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";
import type { Pos } from "~/core/server/game/utils";

import { Map, MapMode } from "../server/game/map";

export class Renderer {
  gm: Map = new Map();

  private app: PIXI.Application;
  private readonly graphics: PIXI.Graphics = new PIXI.Graphics();

  private readonly textures = [PIXI.Texture.EMPTY, PIXI.Texture.from("/images/general.png"),
    PIXI.Texture.from("/images/city.png"),
    PIXI.Texture.from("/images/mountain.png"),
    PIXI.Texture.from("/images/obstacle.png"), PIXI.Texture.EMPTY];

  selected: Pos | null = null;

  private pileSize: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  private images: PIXI.Sprite[][] = [[]];
  private texts: PIXI.Text[][] = [[]];
  private hitAreas: PIXI.Sprite[][] = [[]];

  private scale = 1;
  private deltaX = 0;
  private deltaY = 0;

  private extraTexts: (string | undefined)[][] = [[]];

  handleMove: (from: Pos, to: Pos) => any = () => false;
  handleSplitArmy: () => any = () => false;
  handleClearMovements: () => any = () => false;
  handleSurrender: () => any = () => false;

  private myColor: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      antialias: true,
      powerPreference: "high-performance",
      view: canvas,
      height: canvas.parentElement?.clientHeight,
      width: canvas.parentElement?.clientWidth
    });

    this.app.stage.addChild(this.graphics);

    canvas.onwheel = event => {
      event.preventDefault();

      this.scale += event.deltaY * -0.002;
      this.scale = Math.min(Math.max(0.125, this.scale), 4);

      this.redraw();
    };

    canvas.onpointerdown = event => {
      const startX = event.pageX, startY = event.pageY;
      const initialDeltaX = this.deltaX, initialDeltaY = this.deltaY;

      canvas.onpointermove = event => {
        const newDeltaX = event.pageX - startX, newDeltaY = event.pageY - startY;

        if (Math.abs(newDeltaX) <= 20 && Math.abs(newDeltaY) <= 20) {
          return;
        }

        this.deltaX = initialDeltaX + newDeltaX;
        this.deltaY = initialDeltaY + newDeltaY;

        this.redraw();
      };

      canvas.onpointerup = event => {
        event.preventDefault();
        canvas.onpointermove = canvas.onpointerup = null;
      };
    };

    const settings = getSettings();

    document.onkeydown = event => {
      if (document.activeElement !== document.body) {
        return;
      }

      const eventKey = event.key === " " ? "Space" : event.key.toUpperCase();

      const keys = settings.game.keys[this.gm.mode];
      for (let [index, key] of keys.move.entries()) {
        if (key === eventKey && this.selected) {
          event.preventDefault();

          const from = this.selected;
          const dir = this.gm.dir(from)[index];
          const to = [from[0] + dir[0], from[1] + dir[1]] as Pos;

          if (this.gm.check(to) && this.gm.accessible(to)) {
            if (this.handleMove(from, to) === false) {
              return;
            }

            this.select(to);
          }

          return;
        }
      }

      if (eventKey === keys.splitArmy) {
        event.preventDefault();
        this.handleSplitArmy();
      } else if (eventKey === keys.clearMovements) {
        event.preventDefault();
        this.handleClearMovements();
      } else if (eventKey === keys.selectHome) {
        event.preventDefault();
        for (let i = 1; i <= this.gm.height; i++) {
          for (let j = 1; j <= this.gm.width; j++) {
            const land = this.gm.get([i, j]);
            if (land.color === this.myColor && land.type === LandType.General) {
              this.select([i, j]);
              return;
            }
          }
        }
      } else if (eventKey === keys.selectTopLeft) {
        event.preventDefault();
        for (let i = 1; i <= this.gm.height; i++) {
          for (let j = 1; j <= this.gm.width; j++) {
            if (this.gm.get([i, j]).color === this.myColor) {
              this.select([i, j]);
              return;
            }
          }
        }
      } else if (eventKey === keys.surrender) {
        event.preventDefault();
        this.handleSurrender();
      }
    };
  }

  private resize() {
    const width = this.app.view.width, height = this.app.view.height;
    let maxXWidth, maxYWidth, realWidth, realHeight;

    switch (this.gm.mode) {
      case MapMode.Hexagon: {
        maxXWidth = width / (1 + 0.75 * (this.gm.width - 1));
        maxYWidth = 4 * height / (Math.sqrt(3) * (1 + 2 * this.gm.height));
        break;
      }
      case MapMode.Square: {
        maxXWidth = width / this.gm.width;
        maxYWidth = height / this.gm.height;
        break;
      }
    }

    this.pileSize = Math.min(maxXWidth, maxYWidth) * this.scale;

    switch (this.gm.mode) {
      case MapMode.Hexagon: {
        realWidth = this.pileSize * (1 + 0.75 * (this.gm.width - 1));
        realHeight = Math.sqrt(3) / 4 * this.pileSize * (1 + 2 * this.gm.height);
        break;
      }
      case MapMode.Square: {
        realWidth = this.pileSize * this.gm.width;
        realHeight = this.pileSize * this.gm.height;
        break;
      }
    }

    this.startX = (width - realWidth) / 2 + this.deltaX;
    this.startY = (height - realHeight) / 2 + this.deltaY;
  }

  private getPileUpperLeftPos([i, j]: Pos) {
    switch (this.gm.mode) {
      case MapMode.Hexagon: {
        return [this.startX + 0.75 * (j - 1) * this.pileSize,
          this.startY + Math.sqrt(3) / 4 * this.pileSize * (2 * (i - 1) + (j % 2 === 0 ? 1 : 0))];
      }
      case MapMode.Square: {
        return [this.startX + (j - 1) * this.pileSize, this.startY + (i - 1) * this.pileSize];
      }
    }
  }

  private getPilePath(pos: Pos) {
    const [upperLeftX, upperLeftY] = this.getPileUpperLeftPos(pos), pileWidth = this.pileSize;

    switch (this.gm.mode) {
      case MapMode.Hexagon: {
        return [upperLeftX + pileWidth / 4, upperLeftY,
          upperLeftX + 0.75 * pileWidth, upperLeftY,
          upperLeftX + pileWidth, upperLeftY + Math.sqrt(3) / 4 * pileWidth,
          upperLeftX + 0.75 * pileWidth, upperLeftY + Math.sqrt(3) / 2 * pileWidth,
          upperLeftX + pileWidth / 4, upperLeftY + Math.sqrt(3) / 2 * pileWidth,
          upperLeftX, upperLeftY + Math.sqrt(3) / 4 * pileWidth];
      }
      case MapMode.Square: {
        return [upperLeftX, upperLeftY,
          upperLeftX + pileWidth, upperLeftY,
          upperLeftX + pileWidth, upperLeftY + pileWidth,
          upperLeftX, upperLeftY + pileWidth];
      }
    }
  }

  private addImages() {
    for (const image of this.images.flat()) {
      this.app.stage.removeChild(image);
      image.destroy();
    }

    this.images = [[]];

    for (let i = 1; i <= this.gm.height; i++) {
      this.images.push([new PIXI.Sprite()]);

      for (let j = 1; j <= this.gm.width; j++) {
        const image = new PIXI.Sprite();
        this.images[i].push(image);
        this.app.stage.addChild(image);
      }
    }
  }

  private setImages() {
    for (let i = 1; i <= this.gm.height; i++) {
      for (let j = 1; j <= this.gm.width; j++) {
        const image = this.images[i][j];

        const [x, y] = this.getPileUpperLeftPos([i, j]);

        switch (this.gm.mode) {
          case MapMode.Hexagon: {
            image.width = image.height = this.pileSize * (3 - Math.sqrt(3)) / 2;
            image.x = x + (this.pileSize - image.width) / 2;
            image.y = y + (Math.sqrt(3) / 2 * this.pileSize - image.height) / 2;
            break;
          }
          case MapMode.Square: {
            image.width = image.height = this.pileSize * 0.78;
            image.x = x + (this.pileSize - image.width) / 2;
            image.y = y + (this.pileSize - image.height) / 2;
            break;
          }
        }
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
      fontSize: 16,
      fill: SpecialColor.SelectedBorder,
      fontWeight: "bold"
    });

    for (let i = 1; i <= this.gm.height; i++) {
      this.texts.push([new PIXI.Text()]);

      for (let j = 1; j <= this.gm.width; j++) {
        const text = new PIXI.Text(undefined, style);
        this.texts[i].push(text);
        this.app.stage.addChild(text);
      }
    }
  }

  updateAmount([i, j]: Pos) {
    let maxWidth, maxHeight;

    switch (this.gm.mode) {
      case MapMode.Hexagon: {
        maxWidth = this.pileSize;
        maxHeight = Math.sqrt(3) / 2 * this.pileSize;
        break;
      }
      case MapMode.Square: {
        maxWidth = maxHeight = this.pileSize;
        break;
      }
    }

    const amount = this.gm.get([i, j]).amount;
    const text = this.texts[i][j];

    const extraText = this.extraTexts[i][j];
    if (extraText) {
      text.text = extraText;
    } else if (amount !== 0) {
      text.text = amount;

      if (text.width > maxWidth) {
        text.text = formatLargeNumber(amount);
      }
    } else {
      text.text = formatLargeNumber(amount);
    }

    const [x, y] = this.getPileUpperLeftPos([i, j]);
    const width = text.width;
    const height = text.height;

    text.x = x + (maxWidth - width) / 2;
    text.y = y + (maxHeight - height) / 2;
  }

  updateType([i, j]: Pos) {
    const type = this.gm.get([i, j]).type;
    this.images[i][j].texture = type === LandType.UnknownCity || type === LandType.UnknownMountain
      ? this.textures[4] : this.textures[type];
  }

  updateGraphics(pos: Pos) {
    const selected = this.selected && this.selected.join() === pos.join();

    const land = this.gm.get(pos);

    let fillColor = colors[land.color];

    if (land.color === 0 && land.type === LandType.Land) {
      fillColor = SpecialColor.Empty;
    } else if (land.type === LandType.Mountain) {
      fillColor = SpecialColor.Mountain;
    } else if (land.type >= LandType.UnknownCity) {
      fillColor = SpecialColor.Unknown;
    }

    const lineWidth = selected ? 4 : 1;
    const alignment = selected ? 0 : 0.5;
    const lineColor = selected ? SpecialColor.SelectedBorder : undefined;

    this.graphics.lineStyle(lineWidth, lineColor, 1, alignment)
      .beginFill(fillColor)
      .drawPolygon(this.getPilePath(pos))
      .endFill();
  }

  updateLand(pos: Pos) {
    this.updateGraphics(pos);
    this.updateType(pos);
    this.updateAmount(pos);
    this.updateHit(pos);
  }

  updateAll() {
    for (let i = 1; i <= this.gm.height; i++) {
      for (let j = 1; j <= this.gm.width; j++) {
        this.updateLand([i, j]);
      }
    }

    this.selected && this.updateGraphics(this.selected);
  }

  unSelect() {
    if (!this.selected) {
      return;
    }

    const preSelected = this.selected;
    this.selected = null;
    this.updateGraphics(preSelected);
  }

  private select(pos: Pos) {
    this.unSelect();
    this.selected = pos;
    this.updateGraphics(pos);
  }

  private addHitAreas() {
    for (const hitArea of this.hitAreas.flat()) {
      this.app.stage.removeChild(hitArea);
      hitArea.destroy();
    }

    this.hitAreas = [[]];

    for (let i = 1; i <= this.gm.height; i++) {
      this.hitAreas.push([new PIXI.Sprite()]);

      for (let j = 1; j <= this.gm.width; j++) {
        const hit = new PIXI.Sprite();
        this.app.stage.addChild(hit);
        this.hitAreas[i].push(hit);
      }
    }
  }

  updateHit(pos: Pos) {
    const hittable = this.gm.accessible(pos) && (this.myColor === 0 || this.gm.get(pos).color === this.myColor)
      , hit = this.hitAreas[pos[0]][pos[1]];

    if (hittable && hit.cursor !== "pointer") {
      hit.cursor = "pointer";
      hit.eventMode = "static";
      hit.on("pointerup", () => this.select(pos));
    } else if (!hittable && hit.cursor === "pointer") {
      hit.cursor = "default";
      hit.eventMode = "none";
      hit.off("pointerup");
    }
  }

  private setHitAreas() {
    const [x, y] = this.getPileUpperLeftPos([1, 1]);
    let path = this.getPilePath([1, 1]);
    for (let p = 0; p < path.length; p += 2) {
      path[p] -= x;
      path[p + 1] -= y;
    }

    const polygon = new PIXI.Polygon(path);

    for (let i = 1; i <= this.gm.height; i++) {
      for (let j = 1; j <= this.gm.width; j++) {
        const hit = this.hitAreas[i][j];

        const [x, y] = this.getPileUpperLeftPos([i, j]);
        hit.position.set(x, y);

        hit.hitArea = polygon;
      }
    }
  }

  private addExtraTexts() {
    this.extraTexts = [[]];

    for (let i = 1; i <= this.gm.height; i++) {
      this.extraTexts.push([undefined]);

      for (let j = 1; j <= this.gm.width; j++) {
        this.extraTexts[i].push(undefined);
      }
    }
  }

  bind(gm: Map, myColor: number) {
    this.gm = gm;
    this.myColor = myColor;

    this.addImages();
    this.addTexts();
    this.addHitAreas();
    this.addExtraTexts();

    this.selected = null;
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

  extraText([i, j]: Pos, text?: string) {
    this.extraTexts[i][j] = text;
    this.updateAmount([i, j]);
  }

  destroy() {
    this.app.destroy(true, true);
  }
}