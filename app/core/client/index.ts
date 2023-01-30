import type { ClientSocket } from "../types";
import { Color } from "~/core/client/colors";
import { getDir } from "~/core/server/game/utils";

import * as PIXI from "pixi.js";

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

  const size = 20;
  let selected: number[] = [];

  let hexagonWidth: number, hexagonHeight: number, hexagonWidthSmall: number,
    hexagonRadius: number, startX: number,
    startY: number;

  function setDefaultWidth() {
    const width = app.view.width;
    const height = app.view.height;

    const maxXWidth = width / (size + 0.5);
    const maxYWidth = height / (1 + (size - 1) * 0.75) / (2 / Math.sqrt(3));

    hexagonWidth = Math.min(maxXWidth, maxYWidth);
    hexagonHeight = 2 / Math.sqrt(3) * hexagonWidth;

    hexagonWidthSmall = hexagonWidth / 2 / Math.sqrt(3); // l * sqrt(3) / 6
    hexagonRadius = hexagonWidthSmall * 2;

    const realWidth = hexagonWidth * (size + 0.5), realHeight = hexagonHeight * (1 + (size - 1) * 0.75);

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

  function update(i: number, j: number) {
    if (i < 1 || i > size || j < 1 || j > size) {
      return;
    }

    const selectedState = selected.length > 0 &&
      getDir(selected[0]).find(([dx, dy]) => selected[0] + dx === i && selected[1] + dy === j);

    graphics.lineStyle(1);
    graphics.beginFill(selectedState ? Color.Selected : Color.Empty);
    graphics.drawPolygon(getHexagonPath(i, j));
    graphics.endFill();
  }

  function updateAll() {
    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        update(i, j);
      }
    }
  }

  function unSelect() {
    const [preSelectedX, preSelectedY] = selected;

    selected = [];

    for (let [dx, dy] of getDir(preSelectedX)) {
      update(dx + preSelectedX, dy + preSelectedY);
    }
  }

  function select(i: number, j: number) {
    if (selected.length > 0) {
      unSelect();
    }

    selected = [i, j];

    for (let [dx, dy] of getDir(i)) {
      update(dx + i, dy + j);
    }
  }

  function setHitArea() {
    const [x, y] = getHexagonUpperLeftPos(1, 1);
    let hexagon = getHexagonPath(1, 1);
    for (let p = 0; p < hexagon.length; p += 2) {
      hexagon[p] -= x;
      hexagon[p + 1] -= y;
    }

    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        const hit = new PIXI.Sprite();

        const [x, y] = getHexagonUpperLeftPos(i, j);
        hit.position.set(x, y);

        hit.hitArea = new PIXI.Polygon(hexagon);
        hit.cursor = "pointer";
        hit.interactive = true;

        hit.on("pointerdown", () => select(i, j));

        app.stage.addChild(hit);
      }
    }
  }

  setDefaultWidth();
  updateAll();
  app.stage.addChild(graphics);
  setHitArea();

  document.onclick = (event) => {
    if (event.target !== document.querySelector("canvas")) {
      unSelect();
    }
  };
}