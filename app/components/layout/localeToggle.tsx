import { IconButton } from "@chakra-ui/button";
import { useRevalidator } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";

import i18nConfig from "~/i18n";

export default function LocaleToggle() {
  const { i18n } = useTranslation();
  const revalidator = useRevalidator();

  return (
    <IconButton
      aria-label="Toggle Language"
      icon={<FaGlobe />}
      isRound
      variant="ghost"
      onClick={() =>
        i18n.changeLanguage(
          i18nConfig.supportedLngs.find(lang => lang !== i18n.language),
          revalidator.revalidate
        )
      }
    />
  );
}
