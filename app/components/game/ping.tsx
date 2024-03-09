import { Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { useClient } from "./clientProvider";

export default function Ping() {
  const { connected, client } = useClient();
  const [ping, setPing] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = Date.now();

      // Volatile, so the packet will be discarded if the socket is not connected.
      client?.volatile.emit("ping", () => {
        setPing(Date.now() - start);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [client]);

  return <Flex>{connected && ping ? <>Ping: {ping}ms</> : <Spinner />}</Flex>;
}
