import { avatarAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

export default createMultiStyleConfigHelpers(
  avatarAnatomy.keys
).defineMultiStyleConfig({
  baseStyle: {
    container: {
      userSelect: "none"
    }
  }
});
