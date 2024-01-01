import { Box, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import BackToTop from "./backToTop";
import Footer from "./footer";
import Navbar from "./navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Box pos="relative" minH="100%">
      <BackToTop />
      <Navbar />
      <Stack
        direction={{ base: "column", md: "row" }}
        maxW="calc(72rem + 28px)"
        mx="auto"
        px="14px"
        pt="82px"
        pb={{ base: "calc(32px + 104px)", md: "calc(32px + 64px)" }} // Padding-bottom + footer height.
        spacing={7}
      >
        {children}
      </Stack>
      <Footer />
    </Box>
  );
}
