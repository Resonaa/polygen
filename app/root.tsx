// noinspection HtmlRequiredTitleElement

import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "@remix-run/react";
import { useEffect } from "react";

import tailwindStylesheet from "./styles/tailwind.css";
import semanticStylesheet from "semantic-ui-css/semantic.min.css";
import { getUser } from "./session.server";
import Layout from "~/components/layout";

export function links() {
  return [{ rel: "stylesheet", href: tailwindStylesheet },
    { rel: "stylesheet", href: semanticStylesheet }];
}

export function meta() {
  return {
    charset: "utf-8",
    viewport: "width=device-width, initial-scale=1, shrink-to-fit=no"
  };
}

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request)
  });
}

export function CatchBoundary() {
  const caught = useCatch();

  useEffect(() => {
    setTimeout(() => window.history.back(), 3000);
  }, []);

  return (
    <html>
    <head>
      <title>错误 - polygen</title>
      <Meta />
      <Links />
    </head>

    <body>
    <Layout type="text" cur="error">
      <p>
        <h1>{caught.status} {caught.statusText}</h1>
      </p>

      <p>3 秒后将返回上一页</p>
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
