import type { ClientSocket } from "../types";
import { colors, SpecialColor } from "~/core/client/colors";
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

  const container = document.querySelector(".twelve");
  if (!container) return;

  const app = new PIXI.Application({
    antialias: true,
    width: container.clientWidth - 28,
    height: container.clientHeight - 28
  });

  container.appendChild(app.view as HTMLCanvasElement);

  const graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  const textures = [undefined, PIXI.Texture.from("/images/general.png"),
    PIXI.Texture.from("/images/city.png"),
    PIXI.Texture.from("/images/mountain.png"),
    PIXI.Texture.from("/images/obstacle.png")];

  let selected: number[] = [], hovered: number[] = [];

  let gm = generateRandomMap(randInt(2, 10), RoomMode.Hexagon);

  let hexagonWidth: number, hexagonHeight: number, hexagonWidthSmall: number,
    hexagonRadius: number, startX: number,
    startY: number;

  let images: PIXI.Sprite[][] = [[]];
  let texts: PIXI.Text[][] = [[]];

  function setDefaultWidth() {
    const width = app.view.width;
    const height = app.view.height;

    const maxXWidth = width / (gm.size + 0.5);
    const maxYWidth = height / (1 + (gm.size - 1) * 0.75) / (2 / Math.sqrt(3));

    hexagonWidth = Math.min(maxXWidth, maxYWidth);
    hexagonHeight = 2 / Math.sqrt(3) * hexagonWidth;

    hexagonWidthSmall = hexagonWidth / 2 / Math.sqrt(3); // l * sqrt(3) / 6
    hexagonRadius = hexagonWidthSmall * 2;

    const realWidth = hexagonWidth * (gm.size + 0.5), realHeight = hexagonHeight * (1 + (gm.size - 1) * 0.75);

    startX = (width - realWidth) / 1.3;
    startY = (height - realHeight) / 2;
  }

  function getHexagonUpperLeftPos(i: number, j: number) {
    const upperLeftX = startX + (j - 1) * hexagonWidth + (i % 2 === 0 ? hexagonWidth / 2 : 0);
    const upperLeftY = startY + (i - 1) * 0.75 * hexagonHeight;

    return [upperLeftX, upperLeftY];
  }

  function getHexagonPath(i: number, j: number) {
    const [upperLeftX, upperLeftY] = getHexagonUpperLeftPos(i, j);

    let path = [upperLeftX, upperLeftY + hexagonWidthSmall];

    path.push(upperLeftX, upperLeftY + hexagonWidthSmall + hexagonRadius);
    path.push(upperLeftX + hexagonWidth / 2, upperLeftY + hexagonHeight);
    path.push(upperLeftX + hexagonWidth, upperLeftY + hexagonWidthSmall + hexagonRadius);
    path.push(upperLeftX + hexagonWidth, upperLeftY + hexagonWidthSmall);
    path.push(upperLeftX + hexagonWidth / 2, upperLeftY);

    return path;
  }

  function setImage() {
    for (let i = 1; i <= gm.size; i++) {
      images.push([new PIXI.Sprite()]);

      for (let j = 1; j <= gm.size; j++) {
        const image = new PIXI.Sprite();

        const [x, y] = getHexagonUpperLeftPos(i, j);

        image.width = image.height = hexagonHeight / 1.5;

        image.x = x + (hexagonWidth - image.width) / 2;
        image.y = y + (hexagonHeight - image.height) / 2;

        images[i].push(image);
        app.stage.addChild(image);
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
      texts.push([new PIXI.Text()]);

      for (let j = 1; j <= gm.size; j++) {
        const text = new PIXI.Text("", style);

        texts[i].push(text);
        app.stage.addChild(text);
      }
    }
  }

  function updateAmount(i: number, j: number, amount: number) {
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
      text = `${Math.round(amount / Math.pow(10, power))}^${power}`;
    }

    texts[i][j].text = text;

    const [x, y] = getHexagonUpperLeftPos(i, j);
    const width = texts[i][j].width;
    const height = texts[i][j].height;

    texts[i][j].x = x + (hexagonWidth - width) / 2;
    texts[i][j].y = y + (hexagonHeight - height) / 2;
  }

  function updateImage(i: number, j: number, type: number) {
    const texture = textures[type];

    if (!texture) {
      return;
    }

    images[i][j].texture = texture;
  }

  function update(i: number, j: number, clean?: boolean) {
    if (i < 1 || i > gm.size || j < 1 || j > gm.size) {
      return;
    }

    const isSelected = selected.length > 0 && i === selected[0] && j === selected[1];
    const isHovered = hovered.length > 0 && i === hovered[0] && j === hovered[1];

    const land = gm.get(i, j);

    let fillColor = colors[land.color];

    if (land.color === 0 && land.type === LandType.Land) {
      fillColor = SpecialColor.Empty;
    }

    const lineWidth = isSelected || clean ? 4 : isHovered ? 2 : 0.5;
    const lineColor = (isSelected || isHovered) && !clean ? SpecialColor.SelectedBorder : undefined;

    graphics.lineStyle(lineWidth, lineColor);
    graphics.beginFill(fillColor);
    graphics.drawPolygon(getHexagonPath(i, j));
    graphics.endFill();

    updateImage(i, j, land.type);
    updateAmount(i, j, land.amount);
  }

  function updateAll() {
    for (let i = 1; i <= gm.size; i++) {
      for (let j = 1; j <= gm.size; j++) {
        update(i, j);
      }
    }
  }

  function unSelect() {
    const [preSelectedX, preSelectedY] = selected;

    selected = [];

    update(preSelectedX, preSelectedY, true);
    update(preSelectedX, preSelectedY);

    for (let [nx, ny] of getNeighbours(gm, [preSelectedX, preSelectedY])) {
      update(nx, ny);
    }
  }

  function select(i: number, j: number) {
    if (selected.length > 0) {
      unSelect();
    }

    selected = [i, j];

    update(i, j);
  }

  function unHover() {
    const [preHoveredX, preHoveredY] = hovered;

    hovered = [];

    update(preHoveredX, preHoveredY, true);
    update(preHoveredX, preHoveredY);

    for (let [nx, ny] of getNeighbours(gm, [preHoveredX, preHoveredY])) {
      update(nx, ny);
    }

    if (selected.length > 0) {
      update(selected[0], selected[1]);
    }
  }

  function hover(i: number, j: number) {
    if (hovered.length > 0) {
      unHover();
    }

    hovered = [i, j];

    update(i, j);

    if (selected.length > 0) {
      update(selected[0], selected[1]);
    }
  }

  function setHitArea() {
    const [x, y] = getHexagonUpperLeftPos(1, 1);
    let hexagon = getHexagonPath(1, 1);
    for (let p = 0; p < hexagon.length; p += 2) {
      hexagon[p] -= x;
      hexagon[p + 1] -= y;
    }

    for (let i = 1; i <= gm.size; i++) {
      for (let j = 1; j <= gm.size; j++) {
        if (gm.get(i, j).type === LandType.Mountain) {
          continue;
        }

        const hit = new PIXI.Sprite();

        const [x, y] = getHexagonUpperLeftPos(i, j);
        hit.position.set(x, y);

        hit.hitArea = new PIXI.Polygon(hexagon);
        hit.cursor = "pointer";
        hit.eventMode = "static";

        hit.on("pointerdown", () => select(i, j)).on("pointerenter", () => hover(i, j)).on("pointerleave", unHover);

        app.stage.addChild(hit);
      }
    }
  }

  setDefaultWidth();
  setImage();
  setText();
  updateAll();
  setHitArea();

  document.onclick = (event) => {
    if (event.target !== document.querySelector("canvas")) {
      unSelect();
      unHover();
    }
  };
}