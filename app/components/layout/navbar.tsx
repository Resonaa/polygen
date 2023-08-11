import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Box,
  ButtonGroup,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Stack,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import type { IconType } from "react-icons";
import { FaCrown, FaDove, FaHome, FaTrophy } from "react-icons/fa";

import Auth from "~/components/layout/auth";
import { useOptionalUser } from "~/utils";

import UserDropdown from "./userDropdown";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();
  const user = useOptionalUser();

  return (
    <Box zIndex={999} pos="fixed" top={0} w="100%"
         bg={useColorModeValue("white", "gray.800")}
         color={useColorModeValue("gray.600", "white")}
         borderBottom={1} borderStyle="solid"
         borderColor={useColorModeValue("gray.200", "gray.900")}
    >
      <Flex maxW="6xl" py={2} px={4} mx="auto" align="center">
        <Flex ml={-2} display={{ base: "flex", md: "none" }}>
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant="ghost"
            aria-label="Toggle Navigation"
          />
        </Flex>
        <Flex flex={1} justify="start" align="center">
          <Text
            pl={useBreakpointValue({ base: 3, md: 0 })}
            textAlign={useBreakpointValue({ base: "center", md: "left" })}
            fontFamily="heading"
            color={useColorModeValue("gray.800", "white")}
            fontSize="xl"
            fontWeight={600}
          >
            polygen
          </Text>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <ButtonGroup spacing={4} size="md">
          <IconButton variant="ghost" onClick={toggleColorMode} aria-label="Toggle ColorMode"
                      display={{ base: "none", md: "inline-flex" }}
                      icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} />

          {user ? <UserDropdown /> : <Auth />}
        </ButtonGroup>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

function DesktopNav() {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const linkTransition = "color .1s ease";

  return (
    <Stack direction="row" spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Flex
            as={Link} p={2} to={navItem.to} fontSize=".9rem" fontWeight={500}
            align="center" color={linkColor} transition={linkTransition}
            _hover={{
              textDecoration: "none",
              color: linkHoverColor
            }}>
            <Icon as={navItem.icon} mr="5px" />
            {navItem.label}
          </Flex>
        </Box>
      ))}
    </Stack>
  );
}

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue("white", "gray.800")} p={4} display={{ md: "none" }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, to, icon }: NavItem) => {
  return (
    <Stack spacing={4}>
      <Flex py={2} as={Link} to={to} justify="start" align="center"
            _hover={{ textDecoration: "none" }}
            color={useColorModeValue("gray.600", "gray.200")}>
        <Icon as={icon} mr="5px" />
        {label}
      </Flex>
    </Stack>
  );
};

interface NavItem {
  label: string,
  icon: IconType,
  to: string
}

const NAV_ITEMS: Array<NavItem> = [
  { label: "首页", icon: FaHome, to: "/" },
  { label: "游戏", icon: FaCrown, to: "/game" },
  { label: "排行榜", icon: FaTrophy, to: "/leaderboard" },
  { label: "管理后台", icon: FaDove, to: "/admin" }
];