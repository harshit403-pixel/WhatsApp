import { io } from "socket.io-client";

let chatSocket = null;

// Establishes a connection to the chat server using Socket.IO. If a connection already exists, it reuses that connection. The function takes an authentication token as an argument, which is used to authenticate the user with the server.
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
