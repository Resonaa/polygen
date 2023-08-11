import dayjs from "dayjs";

export function formatDate(date: string) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss.SSS");
}

export function relativeDate(date: string, now: Date = new Date()) {
  const interval = now.getTime() - new Date(date).getTime();

  const years = Math.floor(interval / (365 * 24 * 3600 * 1000));
  if (years !== 0) {
    return years + "年前";
  }

  const months = Math.floor(interval / (30 * 24 * 3600 * 1000));
  if (months !== 0) {
    return months + "月前";
  }

  const days = Math.floor(interval / (24 * 3600 * 1000));
  if (days !== 0) {
    return days + "天前";
  }

  let rest = interval % (24 * 3600 * 1000);
  const hours = Math.floor(rest / (3600 * 1000));
  if (hours !== 0) {
    return hours + "小时前";
  }

  rest = rest % (3600 * 1000);
  const minutes = Math.floor(rest / (60 * 1000));
  if (minutes !== 0) {
    return minutes + "分钟前";
  }

  rest = rest % (60 * 1000);
  const seconds = Math.round(rest / 1000);
  return seconds + "秒前";
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