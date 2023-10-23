import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode, useColorModeValue, IconButton } from "@chakra-ui/react";

export default function ColorModeToggle() {
  const { toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle ColorMode"
      icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
      isRound
      onClick={toggleColorMode}
      variant="ghost"
    />
  );
}
