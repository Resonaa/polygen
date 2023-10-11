import { resolve } from "path";

import Backend from "i18next-fs-backend";
import { RemixI18Next } from "remix-i18next";

import i18n from "~/i18n";
import { getKeyFromCookies } from "~/root";

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    order: ["cookie", "header"]
  },
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json")
    }
  },
  plugins: [Backend]
});

const I18NEXT_KEY = "i18next";

export async function getLocale(request: Request) {
  return (
    getKeyFromCookies(request.headers.get("Cookie"), I18NEXT_KEY) ??
    (await i18next.getLocale(request))
  );
}

export async function getT(request: Request) {
  return await i18next.getFixedT(await getLocale(request));
}
