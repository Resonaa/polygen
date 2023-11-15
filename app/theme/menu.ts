import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  menuAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    list: {
      border: "none",
      shadow: "xl",
      rounded: "xl",
      padding: 2
    },
    item: {
      transition: "all .15s ease",
      rounded: "full",
      _hover: {
        color: "black"
      },
      _dark: {
        color: "gray.200",
        _hover: {
          color: "white"
        }
      }
    },
    divider: {
      borderBottomColor: "gray.300",
      _dark: {
        borderBottomColor: "gray.600"
      }
    }
  }
});
