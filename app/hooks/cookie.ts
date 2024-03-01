import { useRouteLoaderData } from "@remix-run/react";

import type { loader } from "~/root";

/**
 * Gets the value of a key in the given cookie string.
 *
 * @return The cookie value. Undefined if not exists.
 */
export function getCookieValue(cookie: string | undefined | null, key: string) {
  // Regex for matching the given cookie.
  const regex = new RegExp(`(^| )${key}=([^;]+)`);

  return cookie?.match(regex)?.at(2);
}

/**
 * Gets a cookie value from root loader data.
 */
export function useCookieValue(key: string, defaultValue: string) {
  // Safe for non-null assertion because root loader data is always available.
  const data = useRouteLoaderData<typeof loader>("root")!;

  // Use document.cookie on the client side, or data.cookie on the server.
  return (
    getCookieValue(
      typeof document === "undefined" ? data.cookie : document.cookie,
      key
    ) ?? defaultValue
  );
}

/**
 * Key for color mode in cookies.
 */
export const COLOR_MODE_KEY = "chakra-ui-color-mode";

/**
 * Default color mode.
 */
export const DEFAULT_COLOR_MODE = "light";
