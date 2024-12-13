import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  tagAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    container: {
      rounded: "full",
      transition: "filter .2s ease-in-out",
      _hover: {
        filter: "brightness(.9)"
      }
    }
  }
});
