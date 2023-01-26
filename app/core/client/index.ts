import type { ClientSocket } from "../types";

import * as PIXI from "pixi.js";

export function registerClientSocket(client: ClientSocket, rid: string) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const app = new PIXI.Application({ antialias: true });
  document.querySelector(".twelve")?.appendChild(app.view as HTMLCanvasElement);

  const basicText = new PIXI.Text("polygen");
  basicText.x = 50;
  basicText.y = 100;
  basicText.style.fill = "#FFFFFF";

  app.stage.addChild(basicText);
}