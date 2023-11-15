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
import { useContext } from "react";
import type { IconType } from "react-icons";

import { DEFAULT_DOVE, DOVE_KEY, useCookieValue } from "~/hooks/cookie";
import { ForceUpdateContext } from "~/hooks/state";

import DoveCompatibleIcon, { doves } from "./doveCompatibleIcon";

function DoveItem({ icon, id }: { icon: IconType; id: number }) {
  const forceUpdate = useContext(ForceUpdateContext);
  const curId = Number(useCookieValue(DOVE_KEY, DEFAULT_DOVE));

  const onClick = () => {
    document.cookie = `${DOVE_KEY}=${id}`;
    forceUpdate();
  };

  return (
    <MenuItem
      justifyContent="space-between"
      _hover={{
        color: "black"
      }}
      _dark={{
        color: "gray.200",
        _hover: {
          color: "white"
        }
      }}
      transition="background .15s ease"
      onClick={onClick}
      rounded="full"
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
        p={2}
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
