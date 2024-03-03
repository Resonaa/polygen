import type { IconButtonProps } from "@chakra-ui/react";
import {
  ButtonGroup,
  Center,
  chakra,
  IconButton,
  Text
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaGithub, FaQq, FaGlobe } from "react-icons/fa6";

import i18nConfig from "~/i18n/i18n";

interface SocialButtonProps extends Omit<IconButtonProps, "aria-label"> {
  label: string;
  href?: string;
}

function SocialButton({ label, ...props }: SocialButtonProps) {
  return (
    <IconButton
      display="inline-flex"
      _hover={{ color: "black" }}
      _dark={{ _hover: { color: "white" } }}
      aria-label="Social"
      title={label}
      {...props}
    />
  );
}

function LocaleToggle() {
  const { i18n, t } = useTranslation();

  return (
    <SocialButton
      icon={<FaGlobe />}
      label={t("nav.switchLanguages")}
      onClick={() =>
        i18n.changeLanguage(
          i18nConfig.supportedLngs.find(lang => lang !== i18n.language)
        )
      }
    />
  );
}

export default function Footer() {
  return (
    <Center
      pos="absolute"
      bottom={0}
      flexDir="column"
      gap={1}
      w="100%"
      py={3}
      color="#888"
      _dark={{
        color: "#777"
      }}
    >
      <Text>
        Copyleft{" "}
        <chakra.span transform="scale(-1,1)" display="inline-block">
          ©
        </chakra.span>{" "}
        2022-2024 polygen
      </Text>

      <ButtonGroup alignItems="center" gap={1} size="sm" variant="unstyled">
        <LocaleToggle />

        <SocialButton
          as="a"
          label="GitHub"
          href="https://github.com/jwcub/polygen"
          icon={<FaGithub />}
        />

        <SocialButton
          as="a"
          label="QQ"
          href="https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=xv13f9IlvpIEKb7Wm0hCO2SGTVrvclkd&authKey=%2FRq0HGhEmqbfUeXovz%2B1BZBNPh4XlQtC%2Bbpz8YjL%2BD3p%2FSZvjoYmy8KZk0G%2BhyzD&noverify=0&group_code=452808481"
          icon={<FaQq />}
        />
      </ButtonGroup>
    </Center>
  );
}
