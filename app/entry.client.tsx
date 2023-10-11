import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";

import i18n from "./i18n";

const cache = createCache({ key: "-" });

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    ...i18n,
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 1000 * 60 * 60 * 24
        },
        {
          loadPath: "/locales/{{lng}}/{{ns}}.json"
        }
      ]
    },
    detection: {
      order: ["cookie", "htmlTag"],
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365
    }
  })
  .then(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <CacheProvider value={cache}>
          <I18nextProvider i18n={i18next}>
            <StrictMode>
              <RemixBrowser />
            </StrictMode>
          </I18nextProvider>
        </CacheProvider>
      );
    });
  });
