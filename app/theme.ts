import { extendTheme } from "@chakra-ui/react";

const styles = {
  global: {
    "p:last-child": {
      marginBottom: 0
    },
    "#nprogress": {
      pointerEvents: "none"
    },
    "#nprogress .bar": {
      background: "#29d",
      position: "fixed",
      zIndex: "1031",
      top: 0,
      left: 0,
      width: "100%",
      height: "2px"
    },
    "#nprogress .peg": {
      display: "block",
      position: "absolute",
      right: 0,
      width: "100px",
      height: "100%",
      boxShadow: "0 0 10px #29d, 0 0 5px #29d",
      opacity: 1.0,
      transform: "rotate(3deg) translate(0px, -4px)"
    }
  }
};

const theme = extendTheme({ styles });

export default theme;
