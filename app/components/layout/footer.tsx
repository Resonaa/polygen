import type { IconButtonProps } from "@chakra-ui/react";
import {
  Box,
  chakra,
  Container,
  Stack,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue
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
    <Tooltip closeOnClick={!props.onClick} label={label} placement="top">
      <IconButton
        bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
        _hover={{
          bg: useColorModeValue("blackAlpha.300", "whiteAlpha.300")
        }}
        aria-label="Social"
        size="sm"
        {...props}
      />
    </Tooltip>
  );
}

function LocaleToggle() {
  const { i18n, t } = useTranslation();

  return (
    <SocialButton
      icon={<FaGlobe />}
      label={t("nav.switch-languages")}
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
    <Box
      pos="absolute"
      bottom={0}
      w="100%"
      color={useColorModeValue("gray.700", "gray.200")}
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Container
        as={Stack}
        align={{ base: "center", md: "center" }}
        justify={{ base: "center", md: "space-between" }}
        direction={{ base: "column", md: "row" }}
        maxW="6xl"
        py={4}
        spacing={4}
      >
        <Text>
          Copyleft{" "}
          <chakra.span transform="scale(-1,1)" display="inline-block">
            ©
          </chakra.span>{" "}
          2022-2024 polygen
        </Text>

        <Stack direction="row" spacing={6}>
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
        </Stack>
      </Container>
    </Box>
  );
}
