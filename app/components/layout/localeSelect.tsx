import {
  Button,
  chakra,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { HiMiniLanguage } from "react-icons/hi2";

import { DropdownRightIcon } from "~/components/layout/userDropdown";
import i18nConfig from "~/i18n";

export default function LocaleSelect() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Menu autoSelect={false}>
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={<DropdownRightIcon isOpen={isOpen} />}
            rounded="full"
            variant="ghost"
          >
            <Flex align="center" h="100%">
              <HiMiniLanguage />
              <chakra.span pl="3px">{t("lang." + i18n.language)}</chakra.span>
            </Flex>
          </MenuButton>
          <MenuList>
            {i18nConfig.supportedLngs.map(language => (
              <MenuItem
                key={language}
                onClick={async () => {
                  await i18n.changeLanguage(language);
                  navigate(location.pathname);
                }}
              >
                {t("lang." + language)}
              </MenuItem>
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  );
}
