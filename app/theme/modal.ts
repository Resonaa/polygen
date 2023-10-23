import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  modalAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    closeButton: {
      rounded: "full"
    },
    dialog: {
      rounded: "xl"
    }
  },
  defaultProps: { size: "lg" }
});
