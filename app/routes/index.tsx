import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";

import Layout from "../components/layout";
import { useOptionalUser } from "~/utils";

export function meta() {
  return {
    title: "首页 - polygen"
  };
}

export default function Index() {
  const user = useOptionalUser();

  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const socket = io();
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.onAny((event, data) => {
      console.log(event, data);
    });
  }, [socket]);

  return (
    <Layout type="text" cur="home">
      {user && (
        <Link
          to="/post"
          className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
        >
          View posts for {user.username}
        </Link>
      )}

      <h1>Welcome to Remix + Socket.io</h1>
      <div>
        <button type="button" onClick={() => socket?.emit("event", "ping")}>
          Send ping
        </button>
      </div>
      <p>See Browser console and Server terminal</p>
    </Layout>
  )
    ;
}
