import { IconButton } from "@chakra-ui/react";
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
      pos="fixed"
      zIndex={387}
      right={6}
      bottom={6}
      shadow="xl"
      transform={isVisible ? undefined : "translateX(64px)"}
      aria-label="Back to top"
      colorScheme="blue"
      icon={<FiArrowUp />}
      onClick={scrollToTop}
    />
  );
}
