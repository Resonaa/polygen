import type { Socket } from "socket.io-client";

export function setClient(client: Socket, rid: string) {
  document.onkeydown = e => {
    const textarea = document.querySelector("textarea");

    if (e.ctrlKey && e.key === "Enter") {
      (document.querySelector("form button") as HTMLButtonElement).click();
    } else if (e.key === "Enter" && document.activeElement !== textarea) {
      e.preventDefault();
      textarea?.focus();
    }
  };

  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  client.on("disconnect", () => {
    window.location.href = "/game";
  });
}