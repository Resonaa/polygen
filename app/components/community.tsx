import { Link } from "@remix-run/react";
import type { CSSProperties} from "react";
import { useEffect, useState } from "react";

export function Avatar({ username }: { username: string }) {
  return (
    <Link to={`/user/${username}`} className="avatar">
      <img alt="avatar" src={`/usercontent/avatar/${username}.jpg`} />
    </Link>
  );
}

export function UserLink({ username, style }: { username: string, style?: CSSProperties }) {
  return (
    <Link to={`/user/${username}`} className="user" style={style}>{username}</Link>
  );
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString().replace(/\//g, "-");
}

/**
 * Don't use this function in SSR. It's UNSAFE!
 */
function deltaDate(date: string) {
  const interval = new Date().getTime() - new Date(date).getTime();

  let years = Math.floor(interval / (365 * 24 * 3600 * 1000));
  if (years == 0) {
    let months = Math.floor(interval / (30 * 24 * 3600 * 1000));
    if (months == 0) {
      let days = Math.floor(interval / (24 * 3600 * 1000));
      if (days == 0) {
        let leaveTime = interval % (24 * 3600 * 1000);
        let hours = Math.floor(leaveTime / (3600 * 1000));
        if (hours == 0) {
          leaveTime = leaveTime % (3600 * 1000);
          let minutes = Math.floor(leaveTime / (60 * 1000));
          if (minutes == 0) {
            leaveTime = leaveTime % (60 * 1000);
            let seconds = Math.round(leaveTime / 1000);
            return seconds + "秒前";
          }
          return minutes + "分钟前";
        }
        return hours + "小时前";
      }
      return days + "天前";
    }
    return months + "月前";
  }
  return years + "年前";
}

export function SafeDeltaDate({ date }: { date: string }) {
  const [delta, setDelta] = useState("");

  useEffect(() => {
    setDelta(deltaDate(date));
  }, [date]);

  return <span>{delta}</span>;
}