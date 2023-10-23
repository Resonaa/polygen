import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  Tooltip,
  useColorModeValue
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FaGithub, FaQq } from "react-icons/fa6";

function SocialButton({
  children,
  label,
  href
}: {
  children: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Tooltip label={label} placement="top">
      <chakra.button
        bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
        rounded="full"
        w={8}
        h={8}
        as="a"
        href={href}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        transition="background 0.3s ease"
        _hover={{
          bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200")
        }}
      >
        {children}
      </chakra.button>
    </Tooltip>
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
          2022-2023 polygen
        </Text>
        <Stack direction="row" spacing={6}>
          <SocialButton label="GitHub" href="https://github.com/jwcub/polygen">
            <FaGithub />
          </SocialButton>
          <SocialButton
            label="QQ"
            href="https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=xv13f9IlvpIEKb7Wm0hCO2SGTVrvclkd&authKey=%2FRq0HGhEmqbfUeXovz%2B1BZBNPh4XlQtC%2Bbpz8YjL%2BD3p%2FSZvjoYmy8KZk0G%2BhyzD&noverify=0&group_code=452808481"
          >
            <FaQq />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  );
}
