import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  ButtonGroup,
  Collapse,
  Flex,
  Icon,
  HStack,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import {
  FaCrown,
  FaHome,
  FaTrophy,
  FaFlask,
  FaCat,
  FaLightbulb
} from "react-icons/fa";

import { useOptionalUser } from "~/hooks/loader";
import type { TFunctionArg } from "~/i18n/i18next";

import UserDropdown, { DropdownRightIcon } from "../user/userDropdown";

import Auth from "./auth";
import ColorModeToggle from "./colorModeToggle";
import HamburgerIcon from "./hamburgerIcon";

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const user = useOptionalUser();

  return (
    <Box
      as="nav"
      pos="fixed"
      zIndex={161}
      top={0}
      w="100vw"
      color="gray.600"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="gray.200"
      _dark={{
        bgColor: "rgba(26, 32, 44, .8)",
        color: "white",
        borderBottomColor: "gray.700"
      }}
      backdropFilter="blur(12px)"
      bgColor="whiteAlpha.800"
    >
      <Flex align="center" maxW="6xl" mx="auto" px={4} py={2}>
        <Flex display={{ base: "flex", md: "none" }} ml={-2}>
          <IconButton
            aria-label="Toggle Navigation"
            icon={<HamburgerIcon isOpen={isOpen} />}
            onClick={onToggle}
            variant="ghost"
          />
        </Flex>
        <Flex align="center" justify="start" flex={1}>
          <Box
            as={Link}
            display={{ base: "none", sm: "block" }}
            pl={{ base: 3, md: 0 }}
            color="gray.800"
            fontFamily="heading"
            fontSize="xl"
            fontWeight={600}
            textAlign="center"
            _dark={{
              color: "white"
            }}
            to="/"
          >
            polygen
          </Box>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <ButtonGroup spacing="13px">
          <ColorModeToggle />
          {user ? <UserDropdown /> : <Auth />}
        </ButtonGroup>
      </Flex>

      <Collapse in={isOpen}>
        <MobileNav onClick={onToggle} />
      </Collapse>
    </Box>
  );
}

function DesktopNav() {
  const { t } = useTranslation();

  return (
    <HStack spacing={4}>
      {NAV_ITEMS.map(({ label, to, children, icon }) => (
        <Popover key={label} placement="bottom-start" trigger="hover">
          <PopoverTrigger>
            <Box>
              <Flex
                as={to ? Link : undefined}
                align="center"
                p={2}
                color="gray.600"
                fontSize=".9rem"
                fontWeight={500}
                _hover={{
                  textDecoration: "none",
                  color: "gray.800"
                }}
                _dark={{
                  color: "gray.200",
                  _hover: {
                    color: "white"
                  }
                }}
                cursor="pointer"
                transition="color .1s ease"
                to={to}
              >
                <Icon as={icon} mr="5px" />
                {t(label)}
              </Flex>
            </Box>
          </PopoverTrigger>

          {children ? (
            <PopoverContent
              minW="xs"
              p={4}
              bg="white"
              border={0}
              shadow="xl"
              _dark={{
                bg: "gray.800"
              }}
              rounded="xl"
            >
              <VStack>
                {children.map(child => (
                  <DesktopSubNav key={child.label} {...child} />
                ))}
              </VStack>
            </PopoverContent>
          ) : null}
        </Popover>
      ))}
    </HStack>
  );
}

function DesktopSubNav({ label, to, icon, description }: NavItem) {
  const transition = "all .2s ease";

  const { t } = useTranslation();

  return (
    <Box
      as={Link}
      display="block"
      w="100%"
      p={2}
      _hover={{ bg: "gray.50" }}
      _dark={{
        _hover: { bg: "gray.900" }
      }}
      transition={transition}
      role="group"
      rounded="lg"
      to={to}
    >
      <HStack align="center">
        <Box color="gray.600" _dark={{ color: "gray.200" }}>
          <Text
            alignItems="center"
            display="flex"
            fontWeight={500}
            _groupHover={{ color: "gray.800", _dark: { color: "white" } }}
            transition={transition}
          >
            <Icon as={icon} mr="5px" />
            {t(label)}
          </Text>

          <Text fontSize="sm">{t(description!)}</Text>
        </Box>
        <Flex
          align="center"
          justify="flex-end"
          flex={1}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          transform="translateX(-10px)"
          transition={transition}
        >
          <Icon
            as={ChevronRightIcon}
            w={5}
            h={5}
            color={"gray.800"}
            _dark={{
              color: "white"
            }}
          />
        </Flex>
      </HStack>
    </Box>
  );
}

function MobileNav({ onClick }: { onClick: () => void }) {
  return (
    <VStack
      alignItems="flex-start"
      gap={3}
      display={{ base: "flex", md: "none" }}
      p={4}
      fontWeight={500}
      userSelect="none"
    >
      {NAV_ITEMS.map(navItem => (
        <MobileNavItem key={navItem.label} onClick={onClick} {...navItem} />
      ))}
    </VStack>
  );
}

function MobileNavItem({
  label,
  to,
  icon,
  children,
  onClick
}: NavItem & {
  onClick: () => void;
}) {
  const { isOpen, onToggle } = useDisclosure({
    defaultIsOpen: true
  });

  const { t } = useTranslation();

  return (
    <VStack
      alignItems="flex-start"
      w="100%"
      onClick={children ? onToggle : onClick}
      spacing={2}
    >
      <Flex
        as={children ? undefined : Link}
        align="center"
        justify="space-between"
        w="100%"
        color="gray.600"
        _hover={{ textDecoration: "none" }}
        _dark={{ color: "gray.200" }}
        to={to}
      >
        <Flex align="center">
          <Icon as={icon} mr="5px" />
          {t(label)}
        </Flex>
        {children ? <DropdownRightIcon isOpen={isOpen} /> : null}
      </Flex>

      <Box as={Collapse} w="100%" mt={0} in={isOpen}>
        <VStack alignItems="normal" gap={3} pl={4} borderLeftWidth="2px">
          {children
            ? children.map(child => (
                <Flex
                  key={child.label}
                  as={Link}
                  align="center"
                  onClick={onClick}
                  to={child.to}
                >
                  <Icon as={child.icon} mr="5px" />
                  {t(child.label)}
                </Flex>
              ))
            : null}
        </VStack>
      </Box>
    </VStack>
  );
}

interface NavItem {
  label: TFunctionArg;
  icon: IconType;
  to?: string;
  children?: NavItem[];
  description?: TFunctionArg;
}

const NAV_ITEMS: NavItem[] = [
  { label: "nav.home", icon: FaHome, to: "/" },
  { label: "nav.game", icon: FaCrown, to: "/game" },
  { label: "nav.leaderboard", icon: FaTrophy, to: "/leaderboard" },
  {
    label: "nav.apps",
    icon: FaFlask,
    children: [
      {
        label: "nav.map",
        icon: FaLightbulb,
        to: "/map",
        description: "nav.mapDescription"
      },
      {
        label: "nav.casualGames",
        icon: FaCat,
        to: "/catch-the-cat",
        description: "nav.casualGamesDescription"
      }
    ]
  }
];
