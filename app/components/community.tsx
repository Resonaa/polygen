import { Link } from "@remix-run/react";

export function Avatar({ username }: { username: string }) {
  return (
    <Link to={`/user/${username}`} className="avatar">
      <img alt="avatar" className="rounded" src={`/usercontent/avatar/${username}.jpg`} />
    </Link>
  );
}

export function UserLink({ username }: { username: string }) {
  return (
    <Link to={`/user/${username}`} className="user">{username}</Link>
  );
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString().replace(/\//g, "-");
}

export function padZero(num: string, zeroes: number) {
  return "0".repeat(Math.max(0, zeroes - num.length)) + num;
}

export function relativeDate(date: string) {
  const now = new Date(), past = new Date(date);

  const pastHours = padZero(past.getHours().toString(), 2),
    pastMinutes = padZero(past.getMinutes().toString(), 2);

  if (now.getFullYear() !== past.getFullYear()) {
    return `${past.getFullYear()}/${past.getMonth() + 1}/${past.getDate()} ${pastHours}:${pastMinutes}`;
  } else if (now.getMonth() !== past.getMonth() || now.getDate() !== past.getDate()) {
    return `${past.getMonth() + 1}/${past.getDate()} ${pastHours}:${pastMinutes}`;
  } else {
    return `${pastHours}:${pastMinutes}`;
  }
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