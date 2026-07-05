import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearChatState,
  applyReceiptUpdates,
  setPresence,
  setSocketStatus,
  setTypingState,
  upsertConversation,
  upsertMessage,
} from "../state/chat.slice";
import {
  connectChatSocket,
  disconnectChatSocket,
} from "../services/socket.client";

const ChatProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthChecked } =
    useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthChecked) {
      return undefined;
    }

    if (!user || !accessToken) {
      disconnectChatSocket();
      dispatch(setSocketStatus("disconnected"));
      dispatch(clearChatState());
      return undefined;
    }

    const socket = connectChatSocket(
      accessToken
    );

    if (!socket) {
      return undefined;
    }

    dispatch(
      setSocketStatus(
        socket.connected
          ? "connected"
          : "connecting"
      )
    );

    const handleConnect = () => {
      dispatch(setSocketStatus("connected"));
    };

    const handleDisconnect = () => {
      dispatch(setSocketStatus("disconnected"));
    };

    const handleNewMessage = (payload) => {
      if (
        !payload.conversation?.isGroup &&
        payload.message.sender?.id &&
        payload.message.sender.id !== user?.id
      ) {
        dispatch(
          setPresence({
            userId: payload.message.sender.id,
            online: true,
            lastSeen: null,
          })
        );
      }

      dispatch(
        upsertConversation(payload.conversation)
      );
      dispatch(
        upsertMessage({
          conversationId:
            payload.message.conversationId,
          message: payload.message,
        })
      );
    };

    const handleDeliveredMessage = (
      payload
    ) => {
      dispatch(
        applyReceiptUpdates({
          conversationId:
            payload.conversationId,
          messages: payload.messages,
        })
      );
    };

    const handleReadMessage = (payload) => {
      dispatch(
        applyReceiptUpdates({
          conversationId:
            payload.conversationId,
          messages: payload.messages,
        })
      );
    };

    const handleTypingStart = (payload) => {
      dispatch(
        setTypingState({
          conversationId:
            payload.conversationId,
          userId: payload.userId,
          active: true,
        })
      );
    };

    const handleTypingStop = (payload) => {
      dispatch(
        setTypingState({
          conversationId:
            payload.conversationId,
          userId: payload.userId,
          active: false,
        })
      );
    };

    const handleUserOnline = (payload) => {
      dispatch(
        setPresence({
          userId: payload.userId,
          online: true,
          lastSeen: null,
        })
      );
    };

    const handleUserOffline = (payload) => {
      dispatch(
        setPresence({
          userId: payload.userId,
          online: false,
          lastSeen: payload.lastSeen,
        })
      );
    };

    const handleGroupCreated = (payload) => {
      dispatch(
        upsertConversation(payload.conversation)
      );
    };

    const handleGroupUpdated = (payload) => {
      dispatch(
        upsertConversation(payload.conversation)
      );
    };

    socket.on("connect", handleConnect);
    socket.on(
      "socket:connect",
      handleConnect
    );
    socket.on(
      "disconnect",
      handleDisconnect
    );
    socket.on(
      "message:new",
      handleNewMessage
    );
    socket.on(
      "message:delivered",
      handleDeliveredMessage
    );
    socket.on(
      "message:read",
      handleReadMessage
    );
    socket.on(
      "typing:start",
      handleTypingStart
    );
    socket.on(
      "typing:stop",
      handleTypingStop
    );
    socket.on(
      "user:online",
      handleUserOnline
    );
    socket.on(
      "user:offline",
      handleUserOffline
    );
    socket.on(
      "group:created",
      handleGroupCreated
    );
    socket.on(
      "group:updated",
      handleGroupUpdated
    );

    return () => {
      socket.off("connect", handleConnect);
      socket.off(
        "socket:connect",
        handleConnect
      );
      socket.off(
        "disconnect",
        handleDisconnect
      );
      socket.off(
        "message:new",
        handleNewMessage
      );
      socket.off(
        "message:delivered",
        handleDeliveredMessage
      );
      socket.off(
        "message:read",
        handleReadMessage
      );
      socket.off(
        "typing:start",
        handleTypingStart
      );
      socket.off(
        "typing:stop",
        handleTypingStop
      );
      socket.off(
        "user:online",
        handleUserOnline
      );
      socket.off(
        "user:offline",
        handleUserOffline
      );
      socket.off(
        "group:created",
        handleGroupCreated
      );
      socket.off(
        "group:updated",
        handleGroupUpdated
      );
    };
  }, [
    accessToken,
    dispatch,
    isAuthChecked,
    user,
  ]);

  return children;
};

export default ChatProvider;
