import { resolve } from "node:path";
import { PassThrough } from "node:stream";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import type { DataFunctionArgs, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import fnv1a from "fnv1a";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";

import i18n from "./i18n";
import { getLocale } from "./i18next.server";

const ABORT_DELAY = 6590;

void i18next
  .use(initReactI18next)
  .use(Backend)
  .init({
    ...i18n,
    backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") }
  });

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const callbackName = isbot(request.headers.get("User-Agent"))
    ? "onAllReady"
    : "onShellReady";

  const instance = i18next.cloneInstance({ lng: await getLocale(request) });

  return new Promise((resolve, reject) => {
    let didError = false;
    const cache = createCache({ key: "-", stylisPlugins: [] });

    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={cache}>
        <I18nextProvider i18n={instance}>
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

    setTimeout(abort, ABORT_DELAY);
  });
}

function hash(payload: string) {
  return '"' + fnv1a(payload).toString(36) + '"';
}

export async function handleDataRequest(
  response: Response,
  { request }: DataFunctionArgs
) {
  response.headers.delete("X-Remix-Response");

  if (!request.url.endsWith("game._index")) {
    return response;
  }

  const body = await response.text();
  const etag = hash(body);
  response.headers.set("ETag", etag);

  if (request.headers.get("If-None-Match") === etag) {
    return new Response(null, { status: 304 });
  } else {
    return new Response(body, {
      status: response.status,
      headers: response.headers
    });
  }
}
