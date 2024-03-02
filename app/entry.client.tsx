import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";

import i18n from "./i18n/i18n";

// Create Emotion cache for each render.
const cache = createCache({ key: "-", stylisPlugins: [] });

// Setup i18next client-side backend.
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ...i18n,
    detection: {
      order: ["cookie", "htmlTag"],
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365 // 1 year
    }
  })
  .then(() => {
    // Hydrate the application.
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
