// noinspection ES6UnusedImports

import { resolve } from "path";
import { PassThrough } from "stream";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import type { EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";

import i18n from "./i18n";
import { getLocale } from "./i18next.server";

const ABORT_DELAY = 6590;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const callbackName = isbot(request.headers.get("User-Agent"))
    ? "onAllReady"
    : "onShellReady";

  const instance = createInstance();
  const lng = await getLocale(request);

  await instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      ...i18n,
      lng,
      backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") }
    });

  return new Promise((resolve, reject) => {
    let didError = false;
    const cache = createCache({ key: "-" });

    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={cache}>
        <I18nextProvider i18n={instance}>
          <RemixServer context={remixContext} url={request.url} />
        </I18nextProvider>
      </CacheProvider>,
      {
        [callbackName]() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          );

          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;

          console.error(error);
        }
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export function handleDataRequest(response: Response) {
  response.headers.delete("X-Remix-Response");
  return response;
}
