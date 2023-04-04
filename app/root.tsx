// noinspection HtmlRequiredTitleElement

import type { LoaderArgs } from "@remix-run/node";
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
import { Grid } from "semantic-ui-react";

import tailwind from "./styles/tailwind.css";
import semantic from "semantic-ui-css/semantic.min.css";
import vditor from "vditor/dist/index.css";

import { requireAuthenticatedOptionalUser } from "./session.server";
import Layout from "~/components/layout";
import { Access } from "~/utils";

export function links() {
  return [
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: semantic },
    { rel: "stylesheet", href: vditor }];
}

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
