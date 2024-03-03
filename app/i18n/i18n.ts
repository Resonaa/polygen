import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime";
import type { InitOptions } from "i18next";
import { getFixedT } from "i18next";

import en from "./en";
import zh from "./zh";

const ns = "translations";

export default {
  supportedLngs: ["zh", "en"],
  fallbackLng: "en",
  ns,
  resources: {
    en: {
      [ns]: en
    },
    zh: {
      [ns]: zh
    }
  }
} satisfies InitOptions;

export function getT<MatchLoaders>(
  matches: ServerRuntimeMetaArgs<MatchLoaders>["matches"]
) {
  const locale = (
    matches.find(({ id }) => id === "root")?.data as { locale: string }
  ).locale;

  return getFixedT(locale);
}
