import { extendTheme } from "@chakra-ui/react";

const styles = {
  global: {
    "p:last-child": {
      marginBottom: 0
    }
  }
};

const theme = extendTheme({ styles });

export default theme;