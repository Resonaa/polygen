import { LinkIcon } from "@chakra-ui/icons";
import type { IconButtonProps } from "@chakra-ui/react";
import { Tooltip, useClipboard, IconButton } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface CopyLinkProps extends Omit<IconButtonProps, "icon" | "aria-label"> {
  link: string;
}

export default function CopyLink({ link, ...props }: CopyLinkProps) {
  // Ensure it renders properly in SSR.
  const { onCopy, hasCopied } = useClipboard(
    typeof location === "undefined" ? link : new URL(link, location.href).href,
    500
  );

  const { t } = useTranslation();

  return (
    <Tooltip isOpen={hasCopied} label={t("community.copied")}>
      <IconButton
        aria-label="Copy link"
        icon={<LinkIcon />}
        onClick={onCopy}
        {...props}
      />
    </Tooltip>
  );
}
