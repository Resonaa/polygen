import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  tableAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    table: {
      textAlign: "center"
    },
    th: {
      textAlign: "inherit"
    },
    td: {
      textAlign: "inherit"
    }
  },
  sizes: {
    md: {
      th: {
        fontSize: "sm"
      }
    }
  }
});
