import { io } from "socket.io-client";
import parser from "socket.io-msgpack-parser";

export function initClient() {
  return io({ transports: ["websocket"], parser });
}
