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

export function relativeDate(date: string) {
  const now = new Date(), past = new Date(date);

  if (now.getFullYear() !== past.getFullYear()) {
    return `${past.getFullYear()}/${past.getMonth()}/${past.getDay()} ${past.getHours()}:${past.getMinutes()}`;
  } else if (now.getMonth() !== past.getMonth() || now.getDay() !== past.getDay()) {
    return `${past.getMonth()}/${past.getDay()} ${past.getHours()}:${past.getMinutes()}`;
  } else {
    return `${past.getHours()}:${past.getMinutes()}`;
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