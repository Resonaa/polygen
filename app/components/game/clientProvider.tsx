import type { ReactNode } from "react";
import { useEffect, useState, createContext, useContext } from "react";

import { initClient } from "~/game/socket/client";
import type { ClientSocket } from "~/game/socket/types";

const context = createContext<ClientSocket | null>(null);

/**
 * Use Socket.IO client stored in Context.
 */
export function useClient():
  | {
      connected: false;
      client: null;
    }
  | { connected: true; client: ClientSocket } {
  const client = useContext(context);
  return client
    ? { connected: true, client }
    : { connected: false, client: null };
}

/**
 * Provides Socket.IO client stored in Context.
 */
export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientSocket | null>(null);

  useEffect(() => {
    const client = initClient();

    setClient(client);

    return () => {
      client.close();
    };
  }, []);

  return <context.Provider value={client}>{children}</context.Provider>;
}
