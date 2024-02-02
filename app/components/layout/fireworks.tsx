import { chakra } from "@chakra-ui/react";
import { Fireworks as FireworksJs } from "fireworks-js";
import { useEffect, useRef } from "react";

export default function Fireworks() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fireworks = new FireworksJs(canvas.current!, {
      explosion: 2,
      intensity: 20,
      particles: 40,
      acceleration: 1.02,
      decay: {
        min: 0.03,
        max: 0.04
      },
      delay: {
        min: 25,
        max: 40
      },
      lineWidth: {
        trace: {
          min: 0.5
        }
      }
    });

    fireworks.start();

    return () => fireworks.stop();
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
