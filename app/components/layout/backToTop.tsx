import { IconButton } from "@chakra-ui/button";
import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export default function BackToTop() {
  const scrollToTop = () => window.scroll({ top: 0, behavior: "smooth" });

  const getVisible = () => document.documentElement.scrollTop > 100;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(getVisible());
    window.onscroll = () => setIsVisible(getVisible());
  }, []);

  return (
    <IconButton
      aria-label="Back to top"
      icon={<FiArrowUp />}
      pos="fixed"
      bottom={12}
      right={10}
      zIndex={387}
      size="lg"
      shadow="xl"
      colorScheme="blue"
      onClick={scrollToTop}
      transform={isVisible ? undefined : "translateX(88px)"}
    />
  );
}
