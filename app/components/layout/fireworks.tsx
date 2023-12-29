import { chakra } from "@chakra-ui/react";
import { Fireworks as FireworksJs } from "fireworks-js";
import { useEffect, useRef } from "react";

export default function Fireworks() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    new FireworksJs(canvas.current!, {
      explosion: 1,
      intensity: 20,
      particles: 40,
      acceleration: 1.02,
      delay: {
        min: 100,
        max: 120
      },
      lineWidth: {
        trace: {
          min: 0.5
        }
      }
    }).start();
  }, []);

  return (
    <chakra.canvas
      id="fireworks"
      w="100vw"
      h="100vh"
      pos="fixed"
      zIndex={1606}
      pointerEvents="none"
      top={0}
      ref={canvas}
    />
  );
}
