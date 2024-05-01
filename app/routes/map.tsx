import { Box, chakra, Center, IconButton } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import _ from "lodash";
import { useEffect, useRef } from "react";
import { FaSync } from "react-icons/fa";

import { Gm } from "~/game/gm/gm";
import Renderer from "~/game/view/renderer";
import { getT } from "~/i18n/i18n";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.map")} - polygen` }];
};

export default function Map() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer | null>(null);

  function generateGm() {
    return Gm.empty(
      _.sample(Object.values(Gm.Mode))!,
      _.random(4, 6),
      _.random(8, 10)
    );
  }

  useEffect(() => {
    const gm = generateGm();

    const _renderer = new Renderer(gm);

    _renderer.init(canvas.current!).then(() => {
      _renderer.updateGraphicsAll();
    });

    renderer.current = _renderer;

    return () => {
      try {
        _renderer.app.destroy(false, true);
      } catch {
        return;
      }
    };
  }, []);

  return (
    <Center flexDir="column" gap={2} w="100%">
      <Box w="500px" h="300px">
        <chakra.canvas ref={canvas} />
      </Box>

      <IconButton
        aria-label="refresh"
        icon={<FaSync />}
        onClick={() => {
          if (!renderer.current) {
            return;
          }

          renderer.current.graphics.clear();
          renderer.current.gm = generateGm();
          renderer.current.updateGraphicsAll();
        }}
      />
    </Center>
  );
}
