import { ChevronDownIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  chakra,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorModeValue
} from "@chakra-ui/react";
import { Link, useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

import { useUser } from "~/utils";

export function DropdownRightIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <Icon
      as={ChevronDownIcon}
      transform={isOpen ? "rotate(180deg)" : undefined}
      transition="all .25s ease-in-out"
    />
  );
}

export default function UserDropdown() {
  const user = useUser();
  const { t } = useTranslation();
  const fetcher = useFetcher();

  const menuItemTransition = "background .15s ease";
  const dividerColor = useColorModeValue("gray.300", "gray.600");

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
              <Avatar
                mr="6px"
                size="xs"
                src={`/usercontent/avatar/${user.username}.avif`}
              />
              {user.username}
            </Flex>
          </MenuButton>
          <MenuList border="none" shadow="xl">
            <MenuItem
              as={Link}
              transition={menuItemTransition}
              icon={<FaUser />}
              to={`/user/${user.username}`}
            >
              {t("nav.profile")}
            </MenuItem>
            <MenuItem
              as={Link}
              transition={menuItemTransition}
              icon={<SettingsIcon />}
              to="/settings"
            >
              {t("nav.settings")}
            </MenuItem>
            <MenuDivider borderBottomColor={dividerColor} />
            <chakra.form
              as={fetcher.Form}
              action="/auth/logout"
              method="post"
              mb={0}
            >
              <MenuItem
                transition={menuItemTransition}
                icon={<FaSignOutAlt />}
                type="submit"
              >
                {t("nav.logout")}
              </MenuItem>
            </chakra.form>
          </MenuList>
        </>
      )}
    </Menu>
  );
}
