import { RemixI18Next } from "remix-i18next/server";

import { getCookieValue } from "~/hooks/cookie";

import i18n from "./i18n";

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    order: ["cookie", "header"]
  },
  i18next: i18n
});

const I18NEXT_KEY = "i18next";

export async function getLocale(request: Request) {
  return (
    getCookieValue(request.headers.get("Cookie"), I18NEXT_KEY) ??
    (await i18next.getLocale(request))
  );
}
