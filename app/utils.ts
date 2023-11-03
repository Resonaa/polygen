import { padZero } from "~/components/community";

export async function ajax(
  method: string,
  url: string,
  data: Record<string, number | string | boolean | undefined | null> = {}
) {
  const body = new FormData();

  for (const key in data) {
    body.append(key, String(data[key]));
  }

  const options = { method, body };

  return await (await fetch(url, options)).json();
}

export function numberColorToString(color: number) {
  return `#${padZero(color.toString(16), 6)}`;
}

export function stringColorToNumber(color: string) {
  return Number(color.replace("#", "0x"));
}
