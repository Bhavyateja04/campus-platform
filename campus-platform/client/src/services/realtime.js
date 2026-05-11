import { io } from "socket.io-client";
import { API_BASE_URL } from "../config";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  return socket;
}
