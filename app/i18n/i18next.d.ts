import type { ParseKeys } from "i18next";

import type translations from "./en";
import type i18n from "./i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: i18n.ns;
    resources: {
      translations: typeof translations;
    };
  }
}

type TFunctionArg = ParseKeys<i18n.ns>;
