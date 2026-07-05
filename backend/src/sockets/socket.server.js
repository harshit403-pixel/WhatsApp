import { Server } from "socket.io";

import { verifyAccessToken } from "../utils/auth.util.js";
import * as chatService from "../services/chat.service.js";
import {
  serializeConversation,
  serializeMessage,
} from "../utils/chat.util.js";
import {
  clearTypingIndicator,
  getOnlineUserIds,
  markUserOffline,
  markUserOnline,
  setTypingIndicator,
} from "../utils/presence.util.js";

let ioInstance = null;

const emitPresenceToPeers = async (
  eventName,
  userId
) => {
  const peerUserIds =
    await chatService.listPeerUserIds(userId);

  for (const peerUserId of peerUserIds) {
    ioInstance
      ?.to(`user:${peerUserId}`)
      .emit(eventName, {
        userId: String(userId),
        lastSeen:
          eventName === "user:offline"
            ? new Date().toISOString()
            : null,
      });
  }
};

const emitConversationMessages = (
  eventName,
  recipientIds,
  payloadBuilder
) => {
  for (const recipientId of recipientIds) {
    ioInstance
      ?.to(`user:${recipientId}`)
      .emit(eventName, payloadBuilder(recipientId));
  }
};

export const getSocketServer = () =>
  ioInstance;

export function initializeSocketServer(
  httpServer
) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    const handshakeToken =
      socket.handshake.auth?.token;
    const headerToken =
      socket.handshake.headers.authorization
        ?.split(" ")[1];
    const token =
      handshakeToken ?? headerToken;

    if (!token) {
      return next(
        new Error(
          "Authentication error: no token provided"
        )
      );
    }

    try {
      const decoded =
        verifyAccessToken(token);

      socket.userId = decoded.userId;

      return next();
    } catch (error) {
      return next(
        new Error(
          "Authentication error: invalid token"
        )
      );
    }
  });

  ioInstance.on("connection", async (socket) => {
    const userRoom = `user:${socket.userId}`;

    console.log(
      "A user connected:",
      socket.userId,
      socket.id
    );

    /**
     * Socket lifecycle:
     * - join a user-specific room so every tab/device can receive direct events
     * - mirror the connection in Redis for presence and delivery decisions
     */
    socket.join(userRoom);
    await markUserOnline(
      socket.userId,
      socket.id
    );
    await emitPresenceToPeers(
      "user:online",
      socket.userId
    );

    socket.emit("socket:connect", {
      userId: String(socket.userId),
    });

    socket.on(
      "message:send",
      async (payload, acknowledge) => {
        try {
          let deliveredUserIds = [];

          if (payload.receiverId) {
            deliveredUserIds =
              await getOnlineUserIds([
                payload.receiverId,
              ]);
          } else if (payload.conversationId) {
            const conversation =
              await chatService.getConversationForUser(
                payload.conversationId,
                socket.userId
              );

            const groupRecipientIds =
              conversation.participants
                .map((participant) =>
                  String(
                    participant?._id ??
                      participant.id ??
                      participant
                  )
                )
                .filter(
                  (participantId) =>
                    participantId !==
                    String(socket.userId)
                );

            deliveredUserIds =
              await getOnlineUserIds(
                groupRecipientIds
              );
          }

          const {
            conversation,
            message,
            recipientIds,
          } =
            await chatService.sendConversationMessage(
              {
                senderId: socket.userId,
                conversationId:
                  payload.conversationId,
                receiverId:
                  payload.receiverId,
                content: payload.content,
                attachments:
                  payload.attachments ?? [],
                deliveredUserIds,
              }
            );

          const serializedMessage =
            serializeMessage(message);

          socket.to(userRoom).emit(
            "message:new",
            {
              conversation:
                serializeConversation(
                  conversation,
                  socket.userId
                ),
              message:
                serializedMessage,
            }
          );

          emitConversationMessages(
            "message:new",
            recipientIds,
            (recipientId) => ({
              conversation:
                serializeConversation(
                  conversation,
                  recipientId
                ),
              message:
                serializedMessage,
            })
          );

          acknowledge?.({
            ok: true,
            data: {
              conversation:
                serializeConversation(
                  conversation,
                  socket.userId
                ),
              message:
                serializedMessage,
            },
          });
        } catch (error) {
          acknowledge?.({
            ok: false,
            message:
              error.message ??
              "Unable to send message",
          });
        }
      }
    );

    socket.on(
      "message:delivered",
      async (payload, acknowledge) => {
        try {
          const {
            conversation,
            messages,
            recipientIds,
          } =
            await chatService.markConversationDelivered(
              {
                conversationId:
                  payload.conversationId,
                userId: socket.userId,
              }
            );

          if (messages.length) {
            const serializedMessages =
              messages.map(serializeMessage);

            emitConversationMessages(
              "message:delivered",
              recipientIds,
              () => ({
                conversationId:
                  String(conversation._id),
                userId: String(socket.userId),
                messages:
                  serializedMessages,
              })
            );
          }

          acknowledge?.({
            ok: true,
          });
        } catch (error) {
          acknowledge?.({
            ok: false,
            message:
              error.message ??
              "Unable to update delivery status",
          });
        }
      }
    );

    socket.on(
      "message:read",
      async (payload, acknowledge) => {
        try {
          const {
            conversation,
            messages,
            recipientIds,
          } =
            await chatService.markConversationRead({
              conversationId:
                payload.conversationId,
              userId: socket.userId,
            });

          if (messages.length) {
            const serializedMessages =
              messages.map(serializeMessage);

            emitConversationMessages(
              "message:read",
              recipientIds,
              () => ({
                conversationId:
                  String(conversation._id),
                userId: String(socket.userId),
                messages:
                  serializedMessages,
              })
            );
          }

          acknowledge?.({
            ok: true,
          });
        } catch (error) {
          acknowledge?.({
            ok: false,
            message:
              error.message ??
              "Unable to update read status",
          });
        }
      }
    );

    socket.on(
      "typing:start",
      async (payload) => {
        try {
          const conversation =
            await chatService.getConversationForUser(
              payload.conversationId,
              socket.userId
            );

          await setTypingIndicator(
            payload.conversationId,
            socket.userId
          );

          emitConversationMessages(
            "typing:start",
            conversation.participants
              .map((participant) =>
                String(
                  participant?._id ??
                    participant.id ??
                    participant
                )
              )
              .filter(
                (participantId) =>
                  participantId !==
                  String(socket.userId)
              ),
            () => ({
              conversationId:
                String(conversation._id),
              userId: String(socket.userId),
            })
          );
        } catch (error) {
          console.log(
            "Typing start failed:",
            error.message
          );
        }
      }
    );

    socket.on(
      "typing:stop",
      async (payload) => {
        try {
          const conversation =
            await chatService.getConversationForUser(
              payload.conversationId,
              socket.userId
            );

          await clearTypingIndicator(
            payload.conversationId,
            socket.userId
          );

          emitConversationMessages(
            "typing:stop",
            conversation.participants
              .map((participant) =>
                String(
                  participant?._id ??
                    participant.id ??
                    participant
                )
              )
              .filter(
                (participantId) =>
                  participantId !==
                  String(socket.userId)
              ),
            () => ({
              conversationId:
                String(conversation._id),
              userId: String(socket.userId),
            })
          );
        } catch (error) {
          console.log(
            "Typing stop failed:",
            error.message
          );
        }
      }
    );

    socket.on("disconnect", async () => {
      console.log(
        "A user disconnected:",
        socket.userId,
        socket.id
      );

      socket.leave(userRoom);

      /**
       * Presence flow:
       * - remove the current socket from Redis
       * - only emit offline if this was the user's last active socket
       */
      const isLastSocket =
        await markUserOffline(
          socket.userId,
          socket.id
        );

      if (isLastSocket) {
        await emitPresenceToPeers(
          "user:offline",
          socket.userId
        );
      }
    });
  });
}
