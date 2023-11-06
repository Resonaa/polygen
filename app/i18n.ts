import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime";
import { getFixedT } from "i18next";

export default {
  supportedLngs: ["zh", "en"],
  fallbackLng: "en"
};

export function getT<MatchLoaders>(
  matches: ServerRuntimeMetaArgs<MatchLoaders>["matches"]
) {
  const locale = (
    matches.find(({ id }) => id === "root")?.data as { locale: string }
  ).locale;

  return getFixedT(locale);
}
