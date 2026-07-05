import * as chatService from "../services/chat.service.js";
import {
  serializeConversation,
  serializeMessage,
} from "../utils/chat.util.js";
import { getPresenceMap } from "../utils/presence.util.js";
import { getSocketServer } from "../sockets/socket.server.js";

const handleError = (res, error) => {
  return res.status(error.status ?? 500).json({
    message:
      error.message ??
      "Something went wrong",
  });
};

const emitGroupEvent = (
  eventName,
  conversation
) => {
  const io = getSocketServer();

  if (!io) {
    return;
  }

  for (const participant of conversation.participants) {
    const participantId = String(
      participant?._id ?? participant.id
    );

    io.to(`user:${participantId}`).emit(
      eventName,
      {
        conversation: serializeConversation(
          conversation,
          participantId
        ),
      }
    );
  }
};

export const listConversations = async (
  req,
  res
) => {
  try {
    const conversations =
      await chatService.listUserConversations(
        req.userId
      );

    const participantIds = conversations.flatMap(
      (conversation) =>
        conversation.participants
          .map((participant) =>
            String(
              participant?._id ?? participant
            )
          )
          .filter(
            (participantId) =>
              participantId !==
              String(req.userId)
          )
    );

    const presenceMap =
      await getPresenceMap(participantIds);

    return res.status(200).json({
      message:
        "Conversations fetched successfully",
      data: conversations.map((conversation) =>
        serializeConversation(
          conversation,
          req.userId,
          presenceMap
        )
      ),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getConversationMessages = async (
  req,
  res
) => {
  try {
    const { conversationId } = req.params;
    const { conversation, messages } =
      await chatService.getConversationMessages({
        conversationId,
        userId: req.userId,
      });

    return res.status(200).json({
      message:
        "Messages fetched successfully",
      data: {
        conversation: serializeConversation(
          conversation,
          req.userId
        ),
        messages: messages.map(serializeMessage),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getOrCreatePrivateConversation =
  async (req, res) => {
    try {
      const { targetUserId } = req.body;

      const conversation =
        await chatService.ensurePrivateConversation(
          {
            userId: req.userId,
            targetUserId,
          }
        );

      return res.status(200).json({
        message:
          "Conversation ready",
        data: serializeConversation(
          conversation,
          req.userId
        ),
      });
    } catch (error) {
      return handleError(res, error);
    }
  };

export const createGroupConversation = async (
  req,
  res
) => {
  try {
    const conversation =
      await chatService.createGroupConversation({
        creatorId: req.userId,
        groupName: req.body.groupName,
        memberIds: req.body.memberIds ?? [],
      });

    emitGroupEvent(
      "group:created",
      conversation
    );

    return res.status(201).json({
      message:
        "Group created successfully",
      data: serializeConversation(
        conversation,
        req.userId
      ),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const renameGroupConversation = async (
  req,
  res
) => {
  try {
    const conversation =
      await chatService.renameGroupConversation({
        conversationId:
          req.params.conversationId,
        userId: req.userId,
        groupName: req.body.groupName,
      });

    emitGroupEvent(
      "group:updated",
      conversation
    );

    return res.status(200).json({
      message:
        "Group updated successfully",
      data: serializeConversation(
        conversation,
        req.userId
      ),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const addGroupMembers = async (
  req,
  res
) => {
  try {
    const conversation =
      await chatService.addGroupMembersToConversation(
        {
          conversationId:
            req.params.conversationId,
          userId: req.userId,
          memberIds: req.body.memberIds ?? [],
        }
      );

    emitGroupEvent(
      "group:updated",
      conversation
    );

    return res.status(200).json({
      message:
        "Members added successfully",
      data: serializeConversation(
        conversation,
        req.userId
      ),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const removeGroupMember = async (
  req,
  res
) => {
  try {
    const conversation =
      await chatService.removeGroupMemberFromConversation(
        {
          conversationId:
            req.params.conversationId,
          userId: req.userId,
          memberId: req.params.memberId,
        }
      );

    emitGroupEvent(
      "group:updated",
      conversation
    );

    return res.status(200).json({
      message:
        "Member removed successfully",
      data: serializeConversation(
        conversation,
        req.userId
      ),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const leaveGroupConversation = async (
  req,
  res
) => {
  try {
    const conversation =
      await chatService.leaveGroupConversation({
        conversationId:
          req.params.conversationId,
        userId: req.userId,
      });

    emitGroupEvent(
      "group:updated",
      conversation
    );

    return res.status(200).json({
      message:
        "Left group successfully",
      data: serializeConversation(
        conversation,
        req.userId
      ),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const markConversationRead = async (
  req,
  res
) => {
  try {
    const { conversation, messages } =
      await chatService.markConversationRead({
        conversationId:
          req.params.conversationId,
        userId: req.userId,
      });

    const io = getSocketServer();

    if (io && messages.length) {
      for (const participant of conversation.participants) {
        const participantId = String(
          participant?._id ?? participant.id
        );

        if (
          participantId ===
          String(req.userId)
        ) {
          continue;
        }

        io.to(`user:${participantId}`).emit(
          "message:read",
          {
            conversationId:
              String(conversation._id),
            userId: String(req.userId),
            messages:
              messages.map(serializeMessage),
          }
        );
      }
    }

    return res.status(200).json({
      message:
        "Conversation marked as read",
      data: {
        conversation: serializeConversation(
          conversation,
          req.userId
        ),
        messages: messages.map(serializeMessage),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};
