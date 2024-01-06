import { resolve } from "node:path";
import { PassThrough } from "node:stream";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  EntryContext
} from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";

import i18n from "./i18n/i18n";
import { getLocale } from "./i18n/i18next.server";
import { hash } from "./wasm/server";

/**
 * Maximum time before aborting the connection.
 */
const ABORT_DELAY = 6590;

// Set up i18next server backend.
void i18next
  .use(initReactI18next)
  .use(Backend)
  .init({
    ...i18n,
    backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") }
  });

/**
 * Handles incoming requests.
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // Bots see the full page on first streaming for SEO.
  const callbackName = isbot(request.headers.get("User-Agent")!)
    ? "onAllReady"
    : "onShellReady";

  // Create i18next instance.
  const instance = i18next.cloneInstance({ lng: await getLocale(request) });

  return new Promise((resolve, reject) => {
    // Whether errors occur during server-side rendering.
    let didError = false;

    // Create Emotion cache for each render.
    const cache = createCache({ key: "-", stylisPlugins: [] });

    // Stream the page to the client.
    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={cache}>
        <I18nextProvider i18n={instance as typeof i18next}>
          <RemixServer context={remixContext} url={request.url} />
        </I18nextProvider>
      </CacheProvider>,
      {
        [callbackName]() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html; charset=utf-8");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          );

          pipe(body);
        },
        onShellError: reject,
        onError(error) {
          didError = true;
          console.error(error);
        }
      }
    );

    // Abort the connection after timeout.
    setTimeout(abort, ABORT_DELAY);
  });
}

/**
 * Caches data responses.
 */
export async function handleDataRequest(
  response: Response,
  { request }: LoaderFunctionArgs | ActionFunctionArgs
) {
  // Delete remix header.
  response.headers.delete("X-Remix-Response");

  // Does not cache root loader or API routes.
  if (request.url.endsWith("_data=root") || request.url.includes("api")) {
    return response;
  }

  // Compute and set the ETag.
  const body = await response.arrayBuffer();
  const etag = hash(new Uint8Array(body)).toString(36);
  response.headers.set("ETag", etag);

  if (request.headers.get("If-None-Match") === etag) {
    // Cache hits.
    return new Response(null, { status: 304 });
  } else {
    // Cache misses.
    return new Response(body, {
      status: response.status,
      headers: response.headers
    });
  }
}
