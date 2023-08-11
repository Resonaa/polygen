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
import { Form, Link, useLocation } from "@remix-run/react";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

import { useUser } from "~/utils";

const StyledForm = chakra(Form);

export default function UserDropdown() {
  const user = useUser();
  const location = useLocation();

  return (
    <Menu>
      <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
        <Flex h="100%" align="center">
          <Avatar size="xs" mr="6px" src={`/usercontent/avatar/${user.username}.webp`} />
          {user.username}
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem icon={<Icon as={FaUser} />} as={Link} to={`/user/${user.username}`}>主页</MenuItem>
        <MenuItem icon={<SettingsIcon />} as={Link} to="/settings">设置</MenuItem>
        <MenuDivider />
        <StyledForm action="/auth/logout" method="post" mb={0}>
          <MenuItem icon={<Icon as={FaSignOutAlt} />} type="submit">登出</MenuItem>
          <input type="hidden" name="redirectTo" value={location.pathname} />
        </StyledForm>
      </MenuList>
    </Menu>
  );
}