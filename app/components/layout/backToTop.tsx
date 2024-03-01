import { IconButton } from "@chakra-ui/button";
import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export default function BackToTop() {
  const scrollToTop = () => window.scroll({ top: 0, behavior: "smooth" });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let preScrollTop = document.documentElement.scrollTop;

    const listener = () => {
      const newScrollTop = document.documentElement.scrollTop;
      setIsVisible(newScrollTop > 161 && newScrollTop < preScrollTop);
      preScrollTop = newScrollTop;
    };

    const options: AddEventListenerOptions = {
      passive: true
    };

    window.addEventListener("scroll", listener, options);
    return () => window.removeEventListener("scroll", listener, options);
  }, []);

  return (
    <IconButton
      aria-label="Back to top"
      icon={<FiArrowUp />}
      pos="fixed"
      bottom={6}
      right={6}
      zIndex={387}
      shadow="xl"
      colorScheme="blue"
      onClick={scrollToTop}
      transform={isVisible ? undefined : "translateX(64px)"}
    />
  );
}
