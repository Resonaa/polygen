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
    return Gm.random(_.sample(Object.values(Gm.Mode))!, 100, 100);
  }

  useEffect(() => {
    const gm = generateGm();

    const _renderer = new Renderer(gm);

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
      <Box w="60vw" h="70vh">
        <chakra.canvas ref={canvas} />
      </Box>

      <IconButton
        aria-label="refresh"
        icon={<FaSync />}
        onClick={() => {
          if (!renderer.current) {
            return;
          }

          renderer.current.gm = generateGm();
          renderer.current.reset();
        }}
      />
    </Center>
  );
}
