import type { HeadingProps } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import type { TFunctionArg } from "~/i18n/i18next";

interface ModuleProps extends Omit<HeadingProps, "title"> {
  title: TFunctionArg;
}

export default function Module({ title, ...props }: ModuleProps) {
  const { t } = useTranslation();

  return (
    <Heading sx={{ fontVariant: "small-caps" }} size="sm" {...props}>
      {t(title)}
    </Heading>
  );
}
