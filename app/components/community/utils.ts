import dayjs from "dayjs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useServerTime } from "~/utils";

export function formatDate(date: string) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function relativeDate(date: string, now: Date) {
  const interval = now.getTime() - new Date(date).getTime();

  const years = Math.floor(interval / (365 * 24 * 3600 * 1000));
  if (years !== 0) {
    return { count: years, unit: "year" };
  }

  const months = Math.floor(interval / (30 * 24 * 3600 * 1000));
  if (months !== 0) {
    return { count: months, unit: "month" };
  }

  const days = Math.floor(interval / (24 * 3600 * 1000));
  if (days !== 0) {
    return { count: days, unit: "day" };
  }

  let rest = interval % (24 * 3600 * 1000);
  const hours = Math.floor(rest / (3600 * 1000));
  if (hours !== 0) {
    return { count: hours, unit: "hour" };
  }

  rest = rest % (3600 * 1000);
  const minutes = Math.floor(rest / (60 * 1000));
  if (minutes !== 0) {
    return { count: minutes, unit: "minute" };
  }

  rest = rest % (60 * 1000);
  const seconds = Math.round(rest / 1000);
  return { count: seconds, unit: "second" };
}

export function useRelativeDateFormatter() {
  const { t } = useTranslation();
  const now = useServerTime();

  return useCallback(
    (date: string) => {
      const { count, unit } = relativeDate(date, now);
      return `${count} ${t("community." + unit)}${t("utils.plurals", {
        count
      })}${t("community.ago")}`;
    },
    [now, t]
  );
}

export function formatLargeNumber(x: number) {
  if (x < 1000) {
    return x.toString();
  } else if (x < 1000000) {
    return `${(x / 1000).toFixed(2)}k`;
  } else {
    return `${(x / 1000000).toFixed(2)}m`;
  }
}
