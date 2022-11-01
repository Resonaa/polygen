// noinspection HtmlRequiredTitleElement

import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

import tailwindStylesheet from "./styles/tailwind.css";
import semanticStylesheet from "semantic-ui-css/semantic.min.css";
import { getUser } from "./session.server";

export function links() {
  return [{ rel: "stylesheet", href: tailwindStylesheet },
    { rel: "stylesheet", href: semanticStylesheet }];
}

export function meta() {
  return {
    charset: "utf-8",
    title: "polygen",
    viewport: "width=device-width,initial-scale=1"
  };
}

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request)
  });
}

export default function App() {
  return (
    <html lang="zh">
    <head>
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
