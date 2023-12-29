import { Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { FaDove, FaTwitter } from "react-icons/fa";
import {
  GiDove,
  GiFreedomDove,
  GiPeaceDove,
  GiHummingbird
} from "react-icons/gi";

import { DEFAULT_DOVE, DOVE_KEY, useCookieValue } from "~/hooks/cookie";

export const doves = [
  FaDove,
  GiDove,
  GiFreedomDove,
  GiHummingbird,
  GiPeaceDove,
  FaTwitter
];

export default function DoveCompatibleIcon<
  T extends {
    as: IconType | "dove";
  }
>({ as, ...props }: T) {
  const index = Number(useCookieValue(DOVE_KEY, DEFAULT_DOVE));

  return <Icon as={as === "dove" ? doves[index] : as} {...props} />;
}
