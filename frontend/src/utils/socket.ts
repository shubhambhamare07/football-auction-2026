import { io, Socket } from "socket.io-client";

const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  return "http://localhost:8000";
};

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== "undefined") {
    socket = io(getSocketUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket backend server, SID:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket backend:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  }
  return socket || ({} as Socket);
};
