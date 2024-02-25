import "@/static/phaser.min";
import "@/static/catchTheCat.min.js";

declare class CatchTheCatGame {
  constructor(_: {
    w: number;
    h: number;
    r: number;
    initialWallCount: number;
    backgroundColor: number;
    parent: string;
    statusBarAlign: string;
    credit: string;
  });

  destroy: () => void;

  canvas: HTMLCanvasElement;
}

const w = 15,
  h = 15,
  r = 16,
  wallDensity = 0.03;

export default function gameSideEffect() {
  const game = new CatchTheCatGame({
    w,
    h,
    r,
    initialWallCount: w * h * wallDensity,
    backgroundColor: 0xffffff,
    parent: "game",
    statusBarAlign: "center",
    credit: "polygen"
  });

  return () => {
    game.destroy();
    game.canvas.remove();
  };
}
