import { io } from "socket.io-client";

let chatSocket = null;

/**
 * Socket lifecycle stays centralized here so the rest of the app can focus on
 * chat behavior instead of connection bookkeeping.
 */
export const connectChatSocket = (token) => {
  if (!token) {
    return null;
  }

  if (!chatSocket) {
    chatSocket = io("/", {
      path: "/socket.io",
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ["websocket"],
      auth: {
        token,
      },
    });
  }

  chatSocket.auth = {
    token,
  };

  if (!chatSocket.connected) {
    chatSocket.connect();
  }

  return chatSocket;
};

export const getChatSocket = () =>
  chatSocket;

export const disconnectChatSocket = () => {
  if (!chatSocket) {
    return;
  }

  chatSocket.removeAllListeners();
  chatSocket.disconnect();
  chatSocket = null;
};
