// noinspection HtmlRequiredTitleElement

import type { LoaderArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Outlet,
  Scripts,
  Meta,
  ScrollRestoration,
  useRouteError
} from "@remix-run/react";
import katex from "katex/dist/katex.min.css";
import semantic from "semantic-ui-css/semantic.min.css";
import { Grid } from "semantic-ui-react";
import light from "vditor/dist/css/content-theme/light.css";
import vditor from "vditor/dist/index.css";
import hljs from "vditor/dist/js/highlight.js/styles/github.css";

import favicon from "static/favicon.ico";
import Layout from "~/components/layout";
import { Access } from "~/utils";

import { requireAuthenticatedOptionalUser } from "./session.server";
import tailwind from "./styles/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: favicon },
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: semantic },
  { rel: "stylesheet", href: vditor },
  { rel: "stylesheet", href: katex },
  { rel: "stylesheet", href: hljs },
  { rel: "stylesheet", href: light }];

function GlobalMeta() {
  return (
    <>
      <meta charSet="uft-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta title="polygen" />
    </>
  );
}

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await requireAuthenticatedOptionalUser(request, Access.Basic)
  });
}

export function ErrorBoundary() {
  const error = useRouteError() as any;

  if (isRouteErrorResponse(error)) {
    return (
      <html>
      <head>
        <GlobalMeta />
        <title>错误 - polygen</title>
        <Meta />
        <Links />
      </head>

      <body>
      <Layout columns={1}>
        <Grid.Column>
          <h1>{error.status} {error.statusText}</h1>
          {error.data}
        </Grid.Column>
      </Layout>
      <Scripts />
      </body>
      </html>
    );
  }

  const errorMessage = error.message ? error.message : "Unknown Error";

  return (
    <html>
    <head>
      <GlobalMeta />
      <title>错误 - polygen</title>
      <Meta />
      <Links />
    </head>

    <body>
    <Layout columns={1}>
      <Grid.Column>
        <h1>{errorMessage}</h1>
      </Grid.Column>
    </Layout>
    <Scripts />
    </body>
    </html>
  );
}

export default function App() {
  return (
    <html lang="zh">
    <head>
      <GlobalMeta />
      <Meta />
      <Links />
    </head>
    <body>
    <Outlet />
    <ScrollRestoration />
    <Scripts />
    <LiveReload />
    </body>
    </html>
  );
}