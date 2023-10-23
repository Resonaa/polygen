import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  menuAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    list: {
      border: "none",
      shadow: "xl",
      rounded: "xl"
    },
    item: {
      transition: "background .15s ease"
    },
    divider: {
      borderBottomColor: "gray.300",
      _dark: {
        borderBottomColor: "gray.600"
      }
    }
  }
});
