import { Flex } from "@chakra-ui/react";
import { useEffect } from "react";

import gameSideEffect from "./catch.client";

export default function CatchTheCat() {
  useEffect(gameSideEffect, []);

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
