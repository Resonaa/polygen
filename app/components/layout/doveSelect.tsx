import { CheckIcon } from "@chakra-ui/icons";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { useOutletContext } from "@remix-run/react";
import type { IconType } from "react-icons";

import { DEFAULT_DOVE, DOVE_KEY, useCookieValue } from "~/hooks/cookie";

import DoveCompatibleIcon, { doves } from "./doveCompatibleIcon";

function DoveItem({ icon, id }: { icon: IconType; id: number }) {
  const forceUpdate = useOutletContext<() => void>();
  const curId = Number(useCookieValue(DOVE_KEY, DEFAULT_DOVE));

  return (
    <MenuItem
      justifyContent="space-between"
      transition="background .15s ease"
      onClick={() => {
        document.cookie = `${DOVE_KEY}=${id}`;
        forceUpdate();
      }}
    >
      <Icon as={icon} />
      {curId === id ? <CheckIcon /> : null}
    </MenuItem>
  );
}

export default function DoveSelect() {
  return (
    <Menu autoSelect={false}>
      <MenuButton
        as={IconButton}
        h={10}
        icon={<DoveCompatibleIcon as="dove" />}
        isRound
        variant="ghost"
      />

      <MenuList
        px={0}
        color={useColorModeValue("gray.600", "white")}
        fontSize="lg"
        border="none"
        shadow="xl"
        rounded="lg"
      >
        {doves.map((icon, id) => (
          <DoveItem icon={icon} id={id} key={id} />
        ))}
      </MenuList>
    </Menu>
  );
}
