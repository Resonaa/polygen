import type { MetaFunction } from "@remix-run/node";

import WasmTest from "~/components/apps/wasmTest";
import { getT } from "~/i18n/i18n";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.wasm-test")} - polygen` }];
};

export default WasmTest;
