import type { ClientSocket } from "../types";
import { colors, SpecialColor } from "~/core/client/colors";
import type { Pos } from "~/core/server/game/utils";
import { getNeighbours } from "~/core/server/game/utils";
import { randInt } from "~/core/client/utils";

import * as PIXI from "pixi.js";
import { generateRandomMap } from "~/core/server/game/generator";
import { RoomMode } from "~/core/server/room";
import { LandType } from "~/core/server/game/land";

export function registerClientSocket(client: ClientSocket, rid: string) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const container = document.querySelector(".ui.grid.container");
  if (!container) return;

  const app = new PIXI.Application({
    antialias: true,
    width: container.clientWidth,
    height: container.clientHeight
  });

  container.prepend(app.view as HTMLCanvasElement);

  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const textures = [undefined, PIXI.Texture.from("/images/general.png"),
    PIXI.Texture.from("/images/city.png"),
    PIXI.Texture.from("/images/mountain.png"),
    PIXI.Texture.from("/images/obstacle.png")];

  let selected: Pos | null = null, hovered: Pos | null = null;

  let gm = generateRandomMap(randInt(2, 16), RoomMode.Hexagon);

  let hexagonWidth: number, hexagonHeight: number, hexagonWidthSmall: number,
    hexagonRadius: number, startX: number,
    startY: number;

  let images: PIXI.Sprite[][] = [[]];
  let texts: PIXI.Text[][] = [[]];
  let hitAreas: PIXI.Sprite[][] = [[]];

  let scale = 1, deltaX = 0, deltaY = 0;

  function setDefaultWidth() {
    const maxXWidth = app.view.width / (gm.size + 0.5);
    const maxYWidth = app.view.height / (1 + (gm.size - 1) * 0.75) / (2 / Math.sqrt(3));

    hexagonWidth = Math.min(maxXWidth, maxYWidth);
    hexagonHeight = 2 / Math.sqrt(3) * hexagonWidth;

    hexagonWidthSmall = hexagonWidth / 2 / Math.sqrt(3); // l * sqrt(3) / 6
    hexagonRadius = hexagonWidthSmall * 2;
  }

  function setStartXY() {
    const realWidth = hexagonWidth * (gm.size + 0.5), realHeight = hexagonHeight * (1 + (gm.size - 1) * 0.75);

    startX = (app.view.width - realWidth) / 2;
    startY = (app.view.height - realHeight) / 2;
  }

  function getHexagonUpperLeftPos([i, j]: Pos) {
    const upperLeftX = startX + (j - 1) * hexagonWidth + (i % 2 === 0 ? hexagonWidth / 2 : 0);
    const upperLeftY = startY + (i - 1) * 0.75 * hexagonHeight;

    return [upperLeftX, upperLeftY];
  }

  function getHexagonPath(pos: Pos) {
    const [upperLeftX, upperLeftY] = getHexagonUpperLeftPos(pos);

    let path = [upperLeftX, upperLeftY + hexagonWidthSmall];

    path.push(upperLeftX, upperLeftY + hexagonWidthSmall + hexagonRadius);
    path.push(upperLeftX + hexagonWidth / 2, upperLeftY + hexagonHeight);
    path.push(upperLeftX + hexagonWidth, upperLeftY + hexagonWidthSmall + hexagonRadius);
    path.push(upperLeftX + hexagonWidth, upperLeftY + hexagonWidthSmall);
    path.push(upperLeftX + hexagonWidth / 2, upperLeftY);

    return path;
  }

  function addImage() {
    for (let i = 1; i <= gm.size; i++) {
      images.push([new PIXI.Sprite()]);

      for (let j = 1; j <= gm.size; j++) {
        const image = new PIXI.Sprite();

        images[i].push(image);
        app.stage.addChild(image);
      }
    }
  }

  function setImage() {
    for (let i = 1; i <= gm.size; i++) {
      for (let j = 1; j <= gm.size; j++) {
        const image = images[i][j];

        const [x, y] = getHexagonUpperLeftPos([i, j]);

        image.width = image.height = hexagonHeight / 1.5;

        image.x = x + (hexagonWidth - image.width) / 2;
        image.y = y + (hexagonHeight - image.height) / 2;
      }
    }
  }

  function addText() {
    for (let i = 1; i <= gm.size; i++) {
      texts.push([new PIXI.Text()]);

      for (let j = 1; j <= gm.size; j++) {
        const text = new PIXI.Text("");

        texts[i].push(text);
        app.stage.addChild(text);
      }
    }
  }

  function setText() {
    const style = new PIXI.TextStyle({
      fontSize: hexagonWidth / 2.2,
      fill: SpecialColor.SelectedBorder,
      fontWeight: "bold"
    });

    for (let i = 1; i <= gm.size; i++) {
      for (let j = 1; j <= gm.size; j++) {
        texts[i][j].style = style;
      }
    }
  }

  function updateAmount([i, j]: Pos, amount: number) {
    let text;

    if (amount <= 0) {
      text = "";
    } else if (amount < 1000) {
      text = String(amount);
    } else if (amount < 10000) {
      text = String(Math.round(amount / 100) / 10) + "k";
    } else if (amount < 100000) {
      text = String(Math.round(amount / 1000)) + "k";
    } else if (amount < 10000000) {
      text = String(Math.round(amount / 100000) / 10) + "m";
    } else if (amount < 100000000) {
      text = String(Math.round(amount / 1000000)) + "m";
    } else {
      const power = Math.round(Math.log10(amount));
      text = `${Math.round(amount / Math.pow(10, power))}e${power}`;
    }

    texts[i][j].text = text;

    const [x, y] = getHexagonUpperLeftPos([i, j]);
    const width = texts[i][j].width;
    const height = texts[i][j].height;

    texts[i][j].x = x + (hexagonWidth - width) / 2;
    texts[i][j].y = y + (hexagonHeight - height) / 2;
  }

  function updateImage([i, j]: Pos, type: number) {
    const texture = textures[type];

    if (!texture) {
      return;
    }

    images[i][j].texture = texture;
  }

  function update(pos: Pos, clean?: boolean) {
    if (!gm.check(pos)) {
      return;
    }

    const isSelected = selected && selected.join() === pos.join();
    const isHovered = hovered && hovered.join() === pos.join();

    const land = gm.get(pos);

    let fillColor = colors[land.color];

    if (land.color === 0 && land.type === LandType.Land) {
      fillColor = SpecialColor.Empty;
    }

    const lineWidth = isSelected || clean ? 4 : isHovered ? 2 : 1;
    const lineColor = (isSelected || isHovered) && !clean ? SpecialColor.SelectedBorder : undefined;

    graphics.lineStyle(lineWidth, lineColor);
    graphics.beginFill(fillColor);
    graphics.drawPolygon(getHexagonPath(pos));
    graphics.endFill();

    updateImage(pos, land.type);
    updateAmount(pos, land.amount);
  }

  function updateAll() {
    for (let i = 1; i <= gm.size; i++) {
      for (let j = 1; j <= gm.size; j++) {
        update([i, j]);
      }
    }

    hovered && update(hovered);
    selected && update(selected);
  }

  function unSelect() {
    if (!selected) {
      return;
    }

    const preSelected = selected;

    selected = null;

    update(preSelected, true);
    update(preSelected);

    for (let neighbour of getNeighbours(gm, preSelected)) {
      update(neighbour);
    }
  }

  function select(pos: Pos) {
    unSelect();

    selected = pos;
    update(pos);
  }

  function unHover() {
    if (!hovered) {
      return;
    }

    const preHovered = hovered;

    hovered = null;
    update(preHovered, true);
    update(preHovered);

    for (let neighbour of getNeighbours(gm, preHovered)) {
      update(neighbour);
    }

    selected && update(selected);
  }

  function hover(pos: Pos) {
    unHover();

    hovered = pos;
    update(pos);

    selected && update(selected);
  }

  function addHitArea() {
    for (let i = 1; i <= gm.size; i++) {
      hitAreas.push([new PIXI.Sprite()]);

      for (let j = 1; j <= gm.size; j++) {
        const hit = new PIXI.Sprite(), pos = [i, j] as Pos;

        if (gm.get(pos).type !== LandType.Mountain) {
          hit.cursor = "pointer";
          hit.interactive = true;
          hit.on("pointerdown", () => select(pos))
            .on("pointerenter", () => hover(pos))
            .on("pointerleave", unHover);
        }

        app.stage.addChild(hit);
        hitAreas[i].push(hit);
      }
    }
  }

  function setHitArea() {
    const [x, y] = getHexagonUpperLeftPos([1, 1]);
    let hexagon = getHexagonPath([1, 1]);
    for (let p = 0; p < hexagon.length; p += 2) {
      hexagon[p] -= x;
      hexagon[p + 1] -= y;
    }

    const polygon = new PIXI.Polygon(hexagon);

    for (let i = 1; i <= gm.size; i++) {
      for (let j = 1; j <= gm.size; j++) {
        const hit = hitAreas[i][j];

        const [x, y] = getHexagonUpperLeftPos([i, j]);
        hit.position.set(x, y);

        hit.hitArea = polygon;
      }
    }
  }

  setDefaultWidth();
  setStartXY();

  addImage();
  setImage();

  addText();
  setText();
  updateAll();

  addHitArea();
  setHitArea();

  document.onclick = event => {
    if (event.target !== document.querySelector("canvas")) {
      unSelect();
      unHover();
    }
  };

  function reDraw() {
    setDefaultWidth();

    hexagonWidth *= scale;
    hexagonHeight *= scale;
    hexagonRadius *= scale;
    hexagonWidthSmall *= scale;

    setStartXY();

    startX += deltaX;
    startY += deltaY;

    setImage();
    setText();
    setHitArea();

    graphics.clear();

    updateAll();
  }

  const canvas = app.view as HTMLCanvasElement;

  canvas.onwheel = event => {
    scale += event.deltaY * -0.002;
    scale = Math.min(Math.max(0.125, scale), 4);

    reDraw();
  };

  canvas.onmousedown = event => {
    const startX = event.pageX, startY = event.pageY;
    const initialDeltaX = deltaX, initialDeltaY = deltaY;

    canvas.onmousemove = event => {
      const newDeltaX = event.pageX - startX, newDeltaY = event.pageY - startY;

      if (Math.abs(newDeltaX) <= 10 && Math.abs(newDeltaY) <= 10) {
        return;
      }

      deltaX = initialDeltaX + newDeltaX;
      deltaY = initialDeltaY + newDeltaY;

      reDraw();
    };

    canvas.onmouseup = () => {
      canvas.onmousemove = canvas.onmouseup = null;
    };
  };
}