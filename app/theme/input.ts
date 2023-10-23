import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  inputAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    field: {
      rounded: "full"
    },
    element: {
      pointerEvents: "none",
      color: "gray.300",
      _dark: {
        color: "gray.500"
      }
    }
  },
  defaultProps: {
    variant: "filled"
  }
});
