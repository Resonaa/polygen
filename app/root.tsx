import {
  AbsoluteCenter,
  chakra,
  ChakraProvider,
  cookieStorageManagerSSR,
  Heading,
  useColorModePreference
} from "@chakra-ui/react";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
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

import Access from "~/access";
import Layout from "~/components/layout/layout";
import theme from "~/theme";

import { requireAuthenticatedOptionalUser } from "./session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: katex }
];

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await requireAuthenticatedOptionalUser(request, Access.Basic),
    time: Date.now(),
    cookies: request.headers.get("Cookie") ?? ""
  });
}

const COLOR_MODE_KEY = "chakra-ui-color-mode";

function getColorModeFromCookies(cookies: string) {
  return cookies
    .match(new RegExp(`(^| )${COLOR_MODE_KEY}=([^;]+)`))
    ?.at(2);
}

function Document({ children, title }: {
  children: ReactNode;
  title?: string;
}) {
  const loaderData = useLoaderData<typeof loader>();
  const defaultColorMode = useColorModePreference() ?? "light";

  let cookies = loaderData?.cookies;

  if (typeof document !== "undefined" || !cookies) {
    cookies = document.cookie;
  }

  let colorMode = useMemo(() => {
    let color = getColorModeFromCookies(cookies);

    if (!color) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cookies += ` ${COLOR_MODE_KEY}=${defaultColorMode}`;
      color = defaultColorMode;
    }

    return color;
  }, [cookies]);

  return (
    <chakra.html lang="zh" h="100%"
                 {...colorMode
                 && { "data-theme": colorMode, style: { colorScheme: colorMode } }
                 }>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {title && <title>{title}</title>}
        <Meta />
        <Links />
        <link rel="stylesheet" href={colorMode === "light" ? github : githubDark} />
      </head>
      <chakra.body
        h="100%"
        {...colorMode && { className: `chakra-ui-${colorMode}` }}>
        <ChakraProvider theme={theme} colorModeManager={cookieStorageManagerSSR(cookies)}>
          {children}
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </chakra.body>
    </chakra.html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as any;

  if (isRouteErrorResponse(error)) {
    return (
      <Document title="错误 - polygen">
        <Layout>
          <AbsoluteCenter>
            <Heading>{error.status} {error.statusText}</Heading>
            {error.data}
          </AbsoluteCenter>
        </Layout>
      </Document>
    );
  }

  const errorMessage = error.message ? error.message : "Unknown Error";

  return (
    <Document title="错误 - polygen">
      <Layout>
        <AbsoluteCenter>
          <Heading>{errorMessage}</Heading>
        </AbsoluteCenter>
      </Layout>
    </Document>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}