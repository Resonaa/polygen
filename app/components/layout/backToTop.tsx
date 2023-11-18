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
      setIsVisible(newScrollTop > 100 && newScrollTop < preScrollTop);
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
