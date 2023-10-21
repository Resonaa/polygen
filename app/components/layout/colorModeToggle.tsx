import { IconButton } from "@chakra-ui/button";
import { useColorMode, useColorModeValue } from "@chakra-ui/color-mode";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function ColorModeToggle() {
  const { toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle ColorMode"
      icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
      isRound
      variant="ghost"
      onClick={toggleColorMode}
    />
  );
}
