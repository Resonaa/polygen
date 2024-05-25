import { Box, chakra, Center, IconButton } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import _ from "lodash";
import { useEffect, useRef } from "react";
import { FaSync } from "react-icons/fa";

import { generateMap } from "~/game/generator/common";
import { Gm } from "~/game/gm/gm";
import { Palette } from "~/game/gm/palette";
import Renderer from "~/game/view/renderer";
import { getT } from "~/i18n/i18n";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.map")} - polygen` }];
};

export default function Map() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer | null>(null);

  function generate() {
    const players = _.random(2, 30);
    const mode = _.sample(Object.values(Gm.Mode))!;

    const gm = generateMap({
      players,
      mode,
      namespace: "@",
      title: "random",
      width: 0.5,
      height: 0.5
    });

    const palette = Palette.colors(players);

    return { gm, palette };
  }

  useEffect(() => {
    const { gm, palette } = generate();

    const _renderer = new Renderer(gm, palette);

    void _renderer.init(canvas.current!);

    renderer.current = _renderer;

    return () => {
      try {
        _renderer.destroy();
      } catch {
        return;
      }
    };
  }, []);

  return (
    <Center flexDir="column" gap={2} w="100%">
      <Box w="100%" h="70vh">
        <chakra.canvas ref={canvas} />
      </Box>

      <IconButton
        aria-label="refresh"
        icon={<FaSync />}
        onClick={() => {
          if (!renderer.current) {
            return;
          }

          const { gm, palette } = generate();
          renderer.current.gm = gm;
          renderer.current.palette = palette;
          renderer.current.reset();
        }}
      />
    </Center>
  );
}
