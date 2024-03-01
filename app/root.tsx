import {
  ChakraProvider,
  cookieStorageManagerSSR,
  useColorModePreference
} from "@chakra-ui/react";
import "@fontsource-variable/fira-code/index.css";
import "@fontsource-variable/noto-sans-sc/index.css";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import "katex/dist/katex.min.css";
import "~/theme/nprogress.less";
import "~/theme/global.less";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import Access from "~/access";
import Layout from "~/components/layout/layout";
import {
  COLOR_MODE_KEY,
  DEFAULT_COLOR_MODE,
  useCookieValue
} from "~/hooks/cookie";
import { useNProgress } from "~/hooks/transition";
import { getLocale } from "~/i18n/i18next.server";
import theme from "~/theme/theme";

import { requireOptionalUser } from "./session.server";

/**
 * Root loader.
 *
 * Loads:
 *
 * - User data without password
 * - Current server time
 * - Client cookie without session
 * - Locale to use in translation
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await requireOptionalUser(request, Access.Basic),
    time: Date.now(),
    cookie: request.headers.get("Cookie")?.replace(/__session.*?;/, "") ?? "",
    locale: await getLocale(request)
  });
}

/**
 * Whether a route loader should revalidates its data.
 */
export function shouldRevalidate({
  defaultShouldRevalidate,
  formAction,
  currentUrl
}: ShouldRevalidateFunctionArgs) {
  // No revalidation when fetching room data.
  if (currentUrl.pathname === "/game" && !formAction) {
    return false;
  }

  return defaultShouldRevalidate;
}

/**
 * Entry component.
 */
export default function App() {
  useNProgress();

  const loaderData = useLoaderData<typeof loader>();
  const defaultColorMode = useColorModePreference() ?? DEFAULT_COLOR_MODE;

  // Get cookie from loader data when rendering on the server.
  const cookie =
    typeof document === "undefined" ? loaderData.cookie : document.cookie;

  const colorMode = useCookieValue(COLOR_MODE_KEY, defaultColorMode);

  const locale = loaderData.locale;
  const { i18n } = useTranslation();

  return (
    <html
      lang={locale}
      style={{ height: "100%", colorScheme: colorMode }}
      dir={i18n.dir()}
      data-theme={colorMode}
    >
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <meta
          name="description"
          content="polygen is a polygon-based web game inspired by generals.io."
        />

        <Meta />

        <Links />
      </head>

      <body style={{ height: "100%" }}>
        <ChakraProvider
          colorModeManager={cookieStorageManagerSSR(cookie)}
          theme={theme}
          toastOptions={{
            defaultOptions: {
              position: "bottom-right"
            }
          }}
        >
          <Layout>
            <Outlet />
          </Layout>
        </ChakraProvider>

        <ScrollRestoration />

        <Scripts />
      </body>
    </html>
  );
}

/**
 * Convenient wrapper for displaying errors.
 */
function ErrorWrapper({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>Error - polygen</title>
      </head>

      <body style={{ textAlign: "center" }}>{children}</body>
    </html>
  );
}

/**
 * Catches and handles route errors.
 */
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorWrapper>
        <h1>
          {error.status} {error.statusText}
        </h1>

        {error.data}
      </ErrorWrapper>
    );
  }

  return (
    <ErrorWrapper>
      <h1>
        {typeof error === "object" &&
        !!error &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Unknown Error"}
      </h1>
    </ErrorWrapper>
  );
}
