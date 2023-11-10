import { defineStyleConfig } from "@chakra-ui/react";

export default defineStyleConfig({
  baseStyle: {
    pos: "relative",
    _hover: {
      textDecoration: "none",
      _before: {
        transform: "scaleX(1) !important"
      }
    },
    _before: {
      pos: "absolute",
      bottom: 0,
      w: "100%",
      h: "1px",
      content: "''",
      bgColor: "currentColor",
      transition: "all .2s",
      transform: "scaleX(0) !important",
      backfaceVisibility: "hidden",
      rounded: "full"
    }
  }
});
