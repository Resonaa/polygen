import { Box, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Footer from "./footer";
import Navbar from "./navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Box pos="relative" minH="100%">
      <Navbar />
      <Stack direction={{ base: "column", md: "row" }} spacing={7} maxW="calc(72rem + 28px)" px="14px"
             mx="auto" pt="70px" pb={{ base: "calc(14px + 104px)", md: "calc(14px + 64px)" }}>
        {children}
      </Stack>
      <Footer />
    </Box>
  );
}