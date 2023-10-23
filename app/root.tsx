// noinspection HtmlRequiredTitleElement

import {
  Center,
  ChakraProvider,
  cookieStorageManagerSSR,
  Heading,
  useColorModePreference,
  useColorModeValue
} from "@chakra-ui/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
import Layout from "~/components/layout/layout";
import { getLocale } from "~/i18next.server";
import theme from "~/theme/theme";
import { useNProgress } from "~/utils";

import { requireOptionalUser } from "./session.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: katex }];

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await requireOptionalUser(request, Access.Basic),
    time: Date.now(),
    cookies: request.headers.get("Cookie") ?? "",
    locale: await getLocale(request)
  });
}

const COLOR_MODE_KEY = "chakra-ui-color-mode";

export function getKeyFromCookies(
  cookies: string | undefined | null,
  key: string
) {
  return cookies?.match(new RegExp(`(^| )${key}=([^;]+)`))?.at(2);
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

  let cookies = loaderData?.cookies;

  if (typeof document !== "undefined") {
    cookies = document.cookie;
  }

  let colorMode = useMemo(() => {
    let color = getKeyFromCookies(cookies, COLOR_MODE_KEY);

    if (!color) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cookies += ` ${COLOR_MODE_KEY}=${defaultColorMode}`;
      color = defaultColorMode;
    }

    return color;
  }, [cookies]);

  const locale = loaderData?.locale ?? "en";
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
        {title && <title>{title}</title>}
        <Meta />
        <Links />
      </head>
      <body
        style={{ height: "100%" }}
        {...(colorMode && { className: `chakra-ui-${colorMode}` })}
      >
        <ChakraProvider
          colorModeManager={cookieStorageManagerSSR(cookies)}
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
  const { t } = useTranslation();

  return (
    <Document title={t("errors.title")}>
      <Layout>
        <Center flexDir="column" w="100%">
          {children}
        </Center>
      </Layout>
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as any;

  if (isRouteErrorResponse(error)) {
    return (
      <RouteErrorWrapper>
        <Heading>
          {error.status} {error.statusText}
        </Heading>
        {error.data}
      </RouteErrorWrapper>
    );
  }

  return (
    <RouteErrorWrapper>
      <Heading>{error.message ?? "Unknown Error"}</Heading>
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
