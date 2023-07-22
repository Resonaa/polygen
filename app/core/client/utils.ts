import _ from "lodash";

export function getPileSizeByScale(scale: number) {
  return 0.1058 * scale * scale * scale - 0.9028 * scale * scale + 6.7619 * scale + 4.5391;
}

export function getScaleByPileSize(pileSize: number) {
  let l = 0, r = 15;
  const eps = 1e-6;

  while (r - l > eps) {
    const mid = (l + r) / 2;
    const pile = getPileSizeByScale(mid);
    if (pile > pileSize) {
      r = mid;
    } else {
      l = mid;
    }
  }

  return r;
}

export function formatLargeNumber(n: number): string {
  let text;

  if (n < 0) {
    return "-" + formatLargeNumber(-n);
  } else if (n === 0) {
    return "";
  } else if (n < 1000) {
    text = String(n);
  } else if (n < 10000) {
    text = String(Math.round(n / 100) / 10) + "k";
  } else if (n < 100000) {
    text = String(Math.round(n / 1000)) + "k";
  } else if (n < 10000000) {
    text = String(Math.round(n / 100000) / 10) + "m";
  } else if (n < 100000000) {
    text = String(Math.round(n / 1000000)) + "m";
  } else {
    const power = Math.round(Math.log10(n));
    text = `${Math.round(n / Math.pow(10, power))}e${power}`;
  }

  return text;
}

export function formatStar(star: number, precision?: number) {
  return _.round(star, precision).toFixed(precision);
}