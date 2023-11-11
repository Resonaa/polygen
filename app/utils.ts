import { padZero } from "~/components/community";

export function numberColorToString(color: number) {
  return `#${padZero(color.toString(16), 6)}`;
}

export function stringColorToNumber(color: string) {
  return Number(color.replace("#", "0x"));
}
