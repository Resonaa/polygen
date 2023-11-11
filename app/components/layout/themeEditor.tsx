import {
  IconButton,
  DrawerHeader,
  ButtonGroup,
  CloseButton,
  useDisclosure,
  Text
} from "@chakra-ui/react";
import {
  ThemeEditor,
  ThemeEditorColors,
  ThemeEditorDrawer,
  ThemeEditorFontSizes,
  useThemeEditor
} from "@hypertheme-editor/chakra-ui";
import { useTranslation } from "react-i18next";
import { CgColorPicker } from "react-icons/cg";
import { FaPalette } from "react-icons/fa";
import { ImFontSize } from "react-icons/im";
import { RiArrowGoBackFill, RiArrowGoForwardFill } from "react-icons/ri";

import ColorModeToggle from "./colorModeToggle";
import DoveSelect from "./doveSelect";

function ThemeEditorDrawerHeader({ onClose }: { onClose: () => void }) {
  const { canUndo, canRedo, undo, redo } = useThemeEditor();
  const { t } = useTranslation();

  return (
    <DrawerHeader
      alignItems="center"
      justifyContent="space-between"
      display="flex"
      px={{ base: 5, lg: 6 }}
      py={{ base: 2, lg: 3 }}
      shadow="sm"
    >
      <Text fontSize="lg">{t("nav.theme-editor")}</Text>

      <ButtonGroup alignItems="center" variant="ghost">
        <ColorModeToggle />

        <DoveSelect />

        <IconButton
          h={10}
          aria-label="undo"
          icon={<RiArrowGoBackFill />}
          isDisabled={!canUndo}
          isRound
          onClick={undo}
        />

        <IconButton
          display={{ base: "none", sm: "inline-flex" }}
          h={10}
          aria-label="redo"
          icon={<RiArrowGoForwardFill />}
          isDisabled={!canRedo}
          isRound
          onClick={redo}
        />

        <CloseButton w={10} h={10} onClick={onClose} rounded="full" />
      </ButtonGroup>
    </DrawerHeader>
  );
}

export default function MyThemeEditor() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        aria-label="edit theme"
        icon={<FaPalette />}
        isRound
        onClick={onOpen}
        variant="ghost"
      />

      <ThemeEditor isOpen={isOpen} onClose={onClose}>
        <ThemeEditorDrawer
          hideUpgradeToPro
          headerComponent={<ThemeEditorDrawerHeader onClose={onClose} />}
          footerComponent={<></>}
        >
          <ThemeEditorColors icon={CgColorPicker} title="Colors" />
          <ThemeEditorFontSizes icon={ImFontSize} title="Font Sizes" />
        </ThemeEditorDrawer>
      </ThemeEditor>
    </>
  );
}
