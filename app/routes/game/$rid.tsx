import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useLoaderData } from "@remix-run/react";
import { Grid } from "semantic-ui-react";

import { requireAuthenticatedUser } from "~/session.server";
import { setClient } from "~/core/client";
import { Access } from "~/utils";

import game from "~/styles/game.css";

export function links() {
  return [{ rel: "stylesheet", href: game }];
}

export function meta() {
  return {
    title: "游戏 - polygen"
  };
}

export async function loader({ request, params }: LoaderArgs) {
  await requireAuthenticatedUser(request, Access.PlayGame);

  invariant(params.rid, "缺少roomId");

  return json(params.rid);
}

export default function Rid() {
  const [socket, setSocket] = useState<Socket>();
  const rid = useLoaderData<typeof loader>();

  useEffect(() => {
    const socket = io();

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    setClient(socket, rid);
  }, [rid, socket]);

  useEffect(() => {
    require("public/js/phaser.min.js");
    require("public/js/catch-the-cat.min.js");

    // @ts-ignore
    new CatchTheCatGame({
      w: 17,
      h: 17,
      r: 15,
      parent: "catch-the-cat",
      statusBarAlign: "center",
      credit: "polygen",
      backgroundColor: 0x000000
    });

    return () => {
      const canvas = document.querySelector("canvas");

      if (canvas)
        canvas.outerHTML = "";
    };
  }, []);

  return (
    <Grid stackable container className="!m-0 !w-full">
      <Grid.Column width={12}>
        <div id="catch-the-cat" className="flex justify-center" style={{ filter: "grayscale(1) invert(1)" }} />
      </Grid.Column>

      <Grid.Column width={4}>
        {rid}
      </Grid.Column>
    </Grid>
  );
}