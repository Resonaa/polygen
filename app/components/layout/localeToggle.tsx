import { IconButton } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";

import i18nConfig from "~/i18n/i18n";

export default function LocaleToggle() {
  const { i18n } = useTranslation();

  return (
    <IconButton
      aria-label="Toggle Language"
      icon={<FaGlobe />}
      onClick={() =>
        i18n.changeLanguage(
          i18nConfig.supportedLngs.find(lang => lang !== i18n.language)
        )
      }
      variant="ghost"
    />
  );
}
