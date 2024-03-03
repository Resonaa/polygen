import type { ParseKeys } from "i18next";

import type translation from "./en";
import type i18n from "./i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: i18n.ns;
    resources: {
      translation: typeof translation;
    };
  }
}

type TFunctionArg = ParseKeys<i18n.ns>;
