import * as PIXI from "pixi.js";

import city from "static/city.png";
import general from "static/general.png";
import mountain from "static/mountain.png";
import obstacle from "static/obstacle.png";
import type { ISettings } from "~/core/client/settings";
import { getSettings } from "~/core/client/settings";
import { formatLargeNumber, getPileSizeByScale, getScaleByPileSize } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";
import type { Pos } from "~/core/server/game/utils";

import { Map, MapMode } from "../server/game/map";

export class Renderer {
  gm: Map = new Map();

  private app: PIXI.Application;
  private readonly graphics: PIXI.Graphics = new PIXI.Graphics();

  private readonly textures = [PIXI.Texture.EMPTY, PIXI.Texture.from(general),
    PIXI.Texture.from(city),
    PIXI.Texture.from(mountain),
    PIXI.Texture.from(obstacle), PIXI.Texture.EMPTY];

  selected: Pos | null = null;

  private pileSize: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  private images: PIXI.Sprite[][] = [[]];
  private texts: PIXI.Text[][] = [[]];
  private hitAreas: PIXI.Sprite[][] = [[]];

  private scale = 1;

  private extraTexts: (string | undefined)[][] = [[]];

  handleMove: (from: Pos, to: Pos) => any = () => false;
  handleSplitArmy: () => any = () => false;
  handleClearMovements: () => any = () => false;
  handleUndoMovement: () => any = () => false;
  handleSurrender: () => any = () => false;
  handleSelect: () => any = () => false;

  private myColor: number = 0;

  settings: ISettings;

  private lastSelected: Pos[] = [];

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

      const newScale = this.scale + (event.deltaY > 0 ? -1 : 1);
      if (newScale >= 1 && newScale <= 15) {
        this.scale = newScale;
        this.redraw();
      }
    };

    canvas.onpointerdown = event => {
      const startX = event.pageX, startY = event.pageY;
      const initialStartX = this.startX, initialStartY = this.startY;
      let flag = false;

      canvas.onpointermove = event => {
        const deltaX = event.pageX - startX, deltaY = event.pageY - startY;

        if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
          flag = true;
        }

        if (!flag) {
          return;
        }

        this.startX = initialStartX + deltaX;
        this.startY = initialStartY + deltaY;

        this.redraw();
      };

      canvas.onpointerup = event => {
        event.preventDefault();
        canvas.onpointermove = canvas.onpointerup = null;
      };
    };

    const settings = getSettings();
    this.settings = settings;

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

            this.lastSelected.push(from);
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
      } else if (eventKey === keys.undoMovement) {
        event.preventDefault();
        const lastSelected = this.lastSelected.pop();
        lastSelected && this.select(lastSelected);
        this.handleUndoMovement();
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

  private getStartPos() {
    let realWidth, realHeight;

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

    return [(this.app.view.width - realWidth) / 2, (this.app.view.height - realHeight) / 2];
  }

  private setDefaultScale() {
    const width = this.app.view.width, height = this.app.view.height;
    let maxXWidth, maxYWidth;

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

    this.pileSize = Math.min(maxXWidth, maxYWidth);
    this.scale = getScaleByPileSize(this.pileSize);
    this.pileSize = getPileSizeByScale(this.scale);

    [this.startX, this.startY] = this.getStartPos();
  }

  private resize() {
    const previousPileSize = this.pileSize;
    this.pileSize = getPileSizeByScale(this.scale);
    const rate = this.pileSize / previousPileSize;

    const width = this.app.view.width, height = this.app.view.height;

    this.startX = width / 2 - rate * (width / 2 - this.startX);
    this.startY = height / 2 - rate * (height / 2 - this.startY);
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
            image.width = image.height = this.pileSize * 0.78125;
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
      fill: this.settings.game.colors.selectedBorder,
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

    let fillColor = this.settings.game.colors.standard[land.color];

    if (land.color === 0 && land.type === LandType.Land) {
      fillColor = this.settings.game.colors.empty;
    } else if (land.type === LandType.Mountain) {
      fillColor = this.settings.game.colors.mountain;
    } else if (land.type >= LandType.UnknownCity) {
      fillColor = this.settings.game.colors.unknown;
    }

    const lineWidth = selected ? (this.pileSize <= 25 ? 3 : 4) : 1;
    const alignment = selected ? 0 : 0.5;
    const lineColor = selected ? this.settings.game.colors.selectedBorder : undefined;

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
      hit.on("pointerup", () => {
        this.select(pos);
        this.lastSelected = [];
        this.handleSelect();
      });
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

    this.setDefaultScale();
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