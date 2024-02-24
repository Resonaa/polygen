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
  MenuList
} from "@chakra-ui/react";
import { Link, useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

import { useUser } from "~/hooks/loader";

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
  const { Form } = useFetcher();

  return (
    <Menu autoSelect={false}>
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={<DropdownRightIcon isOpen={isOpen} />}
            variant="ghost"
          >
            <Flex align="center" h="100%">
              <Avatar
                mr="6px"
                name={user.username}
                size="xs"
                src={`/usercontent/avatar/${user.username}.avif`}
              />
              {user.username}
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem as={Link} icon={<FaUser />} to={`/user/${user.username}`}>
              {t("nav.profile")}
            </MenuItem>
            <MenuItem as={Link} icon={<SettingsIcon />} to="/settings">
              {t("nav.settings")}
            </MenuItem>
            <MenuDivider />
            <chakra.form as={Form} action="/auth/logout" method="post" mb={0}>
              <MenuItem icon={<FaSignOutAlt />} type="submit">
                {t("nav.logout")}
              </MenuItem>
            </chakra.form>
          </MenuList>
        </>
      )}
    </Menu>
  );
}
