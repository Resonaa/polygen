// noinspection HtmlRequiredTitleElement

import {
  ChakraProvider,
  cookieStorageManagerSSR,
  useColorModePreference,
  useColorModeValue
} from "@chakra-ui/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
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
import githubDark from "highlight.js/styles/github-dark.css";
import github from "highlight.js/styles/github.css";
import katex from "katex/dist/katex.min.css";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Access from "~/access";
import { useNProgress } from "~/hooks/transition";
import { getLocale } from "~/i18next.server";
import theme from "~/theme/theme";

import { requireOptionalUser } from "./session.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: katex }];

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await requireOptionalUser(request, Access.Basic),
    time: Date.now(),
    cookie: request.headers.get("Cookie")?.replace(/__session.*?;/, "") ?? "",
    locale: await getLocale(request)
  });
}

export function shouldRevalidate({
  defaultShouldRevalidate,
  formAction,
  currentUrl
}: ShouldRevalidateFunctionArgs) {
  // fetching room data
  if (currentUrl.pathname === "/game" && !formAction) {
    return false;
  }

  return defaultShouldRevalidate;
}

const COLOR_MODE_KEY = "chakra-ui-color-mode";

export function getKeyFromCookie(
  cookie: string | undefined | null,
  key: string
) {
  return cookie?.match(new RegExp(`(^| )${key}=([^;]+)`))?.at(2);
}

function HighlightLink() {
  return <link rel="stylesheet" href={useColorModeValue(github, githubDark)} />;
}

function Document({
  children,
  title
}: {
  children: ReactNode;
  title?: string;
}) {
  useNProgress();

  const loaderData = useLoaderData<typeof loader>();
  const defaultColorMode = useColorModePreference() ?? "light";

  const cookie =
    typeof document === "undefined" ? loaderData.cookie : document.cookie;

  const colorMode = useMemo(
    () => getKeyFromCookie(cookie, COLOR_MODE_KEY) ?? defaultColorMode,
    [cookie, defaultColorMode]
  );

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
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body
        style={{ height: "100%" }}
        {...(colorMode && { className: `chakra-ui-${colorMode}` })}
      >
        <ChakraProvider
          colorModeManager={cookieStorageManagerSSR(cookie)}
          theme={theme}
        >
          {children}
          <HighlightLink />
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RouteErrorWrapper({ children }: { children: ReactNode }) {
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

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <RouteErrorWrapper>
        <h1>
          {error.status} {error.statusText}
        </h1>
        {error.data}
      </RouteErrorWrapper>
    );
  }

  return (
    <RouteErrorWrapper>
      <h1>
        {typeof error === "object" &&
        !!error &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Unknown Error"}
      </h1>
    </RouteErrorWrapper>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
