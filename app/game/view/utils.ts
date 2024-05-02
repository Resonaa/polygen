/**
 * Formats a large number.
 */
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
    const millions = Math.round(n / 100000) / 10;
    text =
      (millions < 1 ? millions.toString().substring(1) : millions.toString()) +
      "m";
  } else if (n < 100000000) {
    text = String(Math.round(n / 1000000)) + "m";
  } else {
    const power = Math.floor(Math.log10(n));
    text = `${Math.round(n / Math.pow(10, power))}e${power}`;
  }

  return text;
}
