import type { MetaFunction } from "@remix-run/node";

import CatchTheCat from "~/components/apps/catchTheCat";
import { getT } from "~/i18n/i18n";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.casualGames")} - polygen` }];
};

export default CatchTheCat;
