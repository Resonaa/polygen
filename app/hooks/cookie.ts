import { useRouteLoaderData } from "@remix-run/react";

import type { loader } from "~/root";

export function getCookieValue(cookie: string | undefined | null, key: string) {
  return cookie?.match(new RegExp(`(^| )${key}=([^;]+)`))?.at(2);
}

export function useCookieValue(key: string, defaultValue: string) {
  const data = useRouteLoaderData<typeof loader>("root")!;

  return (
    getCookieValue(
      typeof document === "undefined" ? data.cookie : document.cookie,
      key
    ) ?? defaultValue
  );
}

export const COLOR_MODE_KEY = "chakra-ui-color-mode";
export const DEFAULT_COLOR_MODE = "light";

export const DOVE_KEY = "dove";
export const DEFAULT_DOVE = "0";
