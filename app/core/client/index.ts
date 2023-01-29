import type { ClientSocket } from "../types";

import * as PIXI from "pixi.js";

export function registerClientSocket(client: ClientSocket, rid: string) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const container = document.querySelector(".twelve");
  if (!container) return;

  const app = new PIXI.Application({
    width: container.clientWidth - 28,
    height: container.clientHeight - 28
  });

  container.appendChild(app.view as HTMLCanvasElement);

  const graphics = new PIXI.Graphics();

  const size = 20;

  function render() {
    const width = app.view.width, height = app.view.height;

    const maxXWidth = width / (size + 0.5);
    const maxYWidth = height / (1 + (size - 1) * (6 - Math.sqrt(3)) / 6);

    const hexagonWidth = Math.min(maxXWidth, maxYWidth);

    const hexagonWidthHalf = hexagonWidth / 2;
    const hexagonWidthSmall = hexagonWidthHalf / Math.sqrt(3); // l * sqrt(3) / 6
    const hexagonRadius = hexagonWidthSmall * 2;

    const startX = (width - hexagonWidth * (size + 0.5)) / 2,
      startY = (height - hexagonWidth * (1 + (size - 1) * (6 - Math.sqrt(3)) / 6)) / 2;

    function getHexagonUpperLeftPos(i: number, j: number) {
      const upperLeftX = startX + (j - 1) * hexagonWidth + (i % 2 === 0 ? hexagonWidthHalf : 0);
      const upperLeftY = startY + (i - 1) * (hexagonWidth - hexagonWidthSmall);

      return [upperLeftX, upperLeftY];
    }

    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        const [upperLeftX, upperLeftY] = getHexagonUpperLeftPos(i, j);

        let path = [upperLeftX, upperLeftY + hexagonWidthSmall];

        path.push(upperLeftX, upperLeftY + hexagonWidthSmall + hexagonRadius);
        path.push(upperLeftX + hexagonWidthHalf, upperLeftY + hexagonWidth);
        path.push(upperLeftX + hexagonWidth, upperLeftY + hexagonWidthSmall + hexagonRadius);
        path.push(upperLeftX + hexagonWidth, upperLeftY + hexagonWidthSmall);
        path.push(upperLeftX + hexagonWidthHalf, upperLeftY);

        if (i === 1 && (j === 1 || j === 2)) {
          console.log(path);
        }

        graphics.lineStyle(1);
        graphics.beginFill(0x636363);
        graphics.drawPolygon(path);
        graphics.endFill();
      }
    }
  }

  render();

  app.stage.addChild(graphics);
}