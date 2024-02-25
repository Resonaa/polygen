import { chakra, Tooltip } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function PrivateIndicator({
  isPrivate
}: {
  isPrivate: boolean;
}) {
  const { t } = useTranslation();

  return isPrivate ? (
    <Tooltip label={t("community.description-private")} openDelay={500}>
      <chakra.strong mr={2}>{t("community.private")}</chakra.strong>
    </Tooltip>
  ) : null;
}
