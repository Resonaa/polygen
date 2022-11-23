// noinspection HtmlRequiredTitleElement

import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "@remix-run/react";

import global from "./styles/global.css";
import tailwind from "./styles/tailwind.css";
import semantic from "semantic-ui-css/semantic.min.css";
import vditor from "vditor/dist/index.css";
import { requireAuthenticatedOptionalUser } from "./session.server";
import Layout from "~/components/layout";
import { Grid } from "semantic-ui-react";
import { Access, useAuthorizedOptionalUser } from "~/utils";

export function links() {
  return [{ rel: "stylesheet", href: global },
    { rel: "stylesheet", href: tailwind },
    { rel: "stylesheet", href: semantic },
    { rel: "stylesheet", href: vditor }];
}

export function meta() {
  return {
    charset: "utf-8",
    viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
    title: "polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await requireAuthenticatedOptionalUser(request, Access.VisitWebsite)
  });
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <html>
    <head>
      <title>错误 - polygen</title>
      <Meta />
      <Links />
    </head>

    <body>
    <Layout columns={1}>
      <Grid.Column>
        <h1>{caught.status} {caught.statusText}</h1>
        {caught.data}
      </Grid.Column>
    </Layout>
    <Scripts />
    </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <html>
    <head>
      <title>错误 - polygen</title>
      <Meta />
      <Links />
    </head>

    <body>
    <Layout columns={1}>
      <Grid.Column>
        <h1>{error.message}</h1>
      </Grid.Column>
    </Layout>
    <Scripts />
    </body>
    </html>
  );
}

export default function App() {
  useAuthorizedOptionalUser(Access.VisitWebsite);

  return (
    <html lang="zh">
    <head>
      <Meta />
      <Links />
    </head>
    <body className="bg-[#f8f9fa]">
    <Outlet />
    <ScrollRestoration />
    <Scripts />
    <LiveReload />
    </body>
    </html>
  );
}
