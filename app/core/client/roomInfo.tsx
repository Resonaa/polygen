import { Icon } from "semantic-ui-react";

import type { ClientSocket } from "~/core/types";

// noinspection JSUnusedLocalSymbols
export function RoomInfo({ client, rid }: { client?: ClientSocket, rid: string }) {
  const copyLink = () => window.navigator.clipboard.writeText(window.location.href);

  return (
    <>
      房间名称：
      <span title="复制链接" className="cursor-pointer hover:underline" onClick={copyLink}>
        {rid}<Icon name="copy" size="mini" />
      </span>
    </>
  );
}