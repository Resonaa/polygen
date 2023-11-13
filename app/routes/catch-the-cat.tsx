import { Flex } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";

import { getT } from "~/i18n";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.casual-games")} - polygen` }];
};

declare class CatchTheCatGame {
  constructor(_: {
    w: number;
    h: number;
    r: number;
    initialWallCount: number;
    backgroundColor: number;
    parent: string;
    statusBarAlign: string;
  });

  destroy: () => void;

  canvas: HTMLCanvasElement;
}

export default function CatchTheCat() {
  useEffect(() => {
    require("../../static/phaser.min");
    require("../../static/catchTheCat.min");

    const w = 15,
      h = 15;

    const game = new CatchTheCatGame({
      w,
      h,
      r: 16,
      initialWallCount: w * h * 0.03,
      backgroundColor: 0xffffff,
      parent: "game",
      statusBarAlign: "center"
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
