import dayjs from "dayjs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import type { TFunctionArg } from "~/i18n/i18next";

import { useServerTime } from "./loader";

export function formatDate(date: Parameters<typeof dayjs>[0]) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function relativeDate(date: Date, now: Date) {
  const interval = now.getTime() - date.getTime();

  const years = Math.floor(interval / (365 * 24 * 3600 * 1000));
  if (years !== 0) {
    return { count: years, unit: "year" as const };
  }

  const months = Math.floor(interval / (30 * 24 * 3600 * 1000));
  if (months !== 0) {
    return { count: months, unit: "month" as const };
  }

  const days = Math.floor(interval / (24 * 3600 * 1000));
  if (days !== 0) {
    return { count: days, unit: "day" as const };
  }

  let rest = interval % (24 * 3600 * 1000);
  const hours = Math.floor(rest / (3600 * 1000));
  if (hours !== 0) {
    return { count: hours, unit: "hour" as const };
  }

  rest = rest % (3600 * 1000);
  const minutes = Math.floor(rest / (60 * 1000));
  if (minutes !== 0) {
    return { count: minutes, unit: "minute" as const };
  }

  rest = rest % (60 * 1000);
  const seconds = Math.round(rest / 1000);
  return { count: seconds, unit: "second" as const };
}

export function useRelativeDateFormatter() {
  const { t } = useTranslation();
  const now = useServerTime();

  return useCallback(
    (date: Date) => {
      const { count, unit } = relativeDate(date, now);
      return `${count} ${t(("community." + unit) as TFunctionArg)}${t(
        "utils.plurals",
        {
          count
        }
      )}${t("community.ago")}`;
    },
    [now, t]
  );
}
