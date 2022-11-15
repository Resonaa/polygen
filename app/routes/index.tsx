import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { json } from "@remix-run/node";

import Layout from "../components/layout";
import Announcement from "~/components/announcement";
import { useOptionalUser } from "~/utils";
import { Grid, Header, Segment } from "semantic-ui-react";

import type { Announcement as ann } from "@prisma/client";
import { getAnnouncements } from "~/models/announcement.server";

export function meta() {
  return {
    title: "首页 - polygen"
  };
}

type LoaderData = {
  announcements: Array<ann>;
};

export async function loader() {
  const announcements = await getAnnouncements() as Array<ann>;

  return json<LoaderData>({ announcements });
}

export default function Index() {
  const user = useOptionalUser();

  const [socket, setSocket] = useState<Socket>();

  const { announcements } = useLoaderData() as LoaderData;

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
    <Layout columns={2} cur="home">
      <Grid.Column width={12}>
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
      </Grid.Column>

      <Grid.Column width={4}>
        <Header as="h4" attached="top" block>
          本站公告
        </Header>
        <Segment attached>
          {announcements.map(({ id, title, content }) => (
            <Announcement id={id} title={title} content={content} key={id} />
          ))}
        </Segment>
      </Grid.Column>
    </Layout>
  );
}
