import { chakra, Center, IconButton } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import _ from "lodash";
import { useEffect, useRef } from "react";
import { FaSync } from "react-icons/fa";

import { generateMap } from "~/game/generator/common";
import { Palette } from "~/game/gm/palette";
import { Map } from "~/game/map";
import RendererNew from "~/game/view/rendererNew";
import { getT } from "~/i18n/i18n";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.map")} - polygen` }];
};

export default function MapElement() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<RendererNew | null>(null);

  function generate() {
    const players = _.random(2, 20);
    const mode = _.sample(Object.values(Map.Mode))!;

    const map = generateMap({
      players,
      mode,
      namespace: "@",
      title: "random"
    });

    const palette = Palette.colors(players);

    return { map, palette };
  }

  useEffect(() => {
    const { map, palette } = generate();

    const _renderer = new RendererNew(canvas.current!, map, palette);

    renderer.current = _renderer;

    return () => {
      _renderer.dispose();
      renderer.current = null;
    };
  }, []);

  return (
    <Center flexDir="column" gap={2} w="100%">
      <chakra.canvas w="100%" h="70vh" ref={canvas} />

      <IconButton
        aria-label="refresh"
        icon={<FaSync />}
        onClick={() => {
          if (!renderer.current) {
            return;
          }

          renderer.current.reset();
          const { map, palette } = generate();
          renderer.current.map = map;
          renderer.current.palette = palette;
          renderer.current.setup();
          renderer.current.render();
        }}
      />
    </Center>
  );
}
