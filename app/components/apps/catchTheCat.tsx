import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";

import catchTheCat from "~/../static/catchTheCat.min.js?raw";
import phaser from "~/../static/phaser.min.js?raw";

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

export default function CatchTheCat() {
  useEffect(() => {
    eval(phaser);
    eval(catchTheCat);

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
  }, []);

  return (
    <Flex
      align="center"
      direction="column"
      w="100%"
      _dark={{ filter: "grayscale(1) invert(1)" }}
      id="game"
    />
  );
}
