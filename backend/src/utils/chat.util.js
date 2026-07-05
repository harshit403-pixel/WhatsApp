/**
 * Small chat-focused serializers keep controller and socket code readable.
 * They also give the frontend a stable shape without leaking raw Mongoose docs.
 */

export const serializeUserSummary = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id ?? user.id),
    username: user.username,
    email: user.email,
  };
};

export const serializeReceipt = (receipt) => {
  if (!receipt) {
    return null;
  }

  return {
    userId: String(
      receipt.user?._id ?? receipt.user ?? ""
    ),
    at: receipt.at ?? null,
  };
};

export const serializeMessage = (message) => {
  if (!message) {
    return null;
  }

  return {
    id: String(message._id ?? message.id),
    conversationId: String(
      message.conversation?._id ??
        message.conversation ??
        ""
    ),
    sender: serializeUserSummary(message.sender),
    content: message.content ?? "",
    attachments: message.attachments ?? [],
    status: message.status,
    deliveredTo:
      message.deliveredTo
        ?.map(serializeReceipt)
        .filter(Boolean) ?? [],
    readBy:
      message.readBy
        ?.map(serializeReceipt)
        .filter(Boolean) ?? [],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

const getUnreadCount = (
  unreadCounts,
  userId
) => {
  if (!unreadCounts) {
    return 0;
  }

  if (typeof unreadCounts.get === "function") {
    return Number(
      unreadCounts.get(String(userId)) ?? 0
    );
  }

  return Number(
    unreadCounts[String(userId)] ?? 0
  );
};

export const serializeConversation = (
  conversation,
  currentUserId,
  presenceMap = new Map()
) => {
  if (!conversation) {
    return null;
  }

  const participants =
    conversation.participants
      ?.map(serializeUserSummary)
      .filter(Boolean) ?? [];

  const admins =
    conversation.admins?.map((admin) =>
      String(admin?._id ?? admin ?? "")
    ) ?? [];

  const currentUserIdString =
    String(currentUserId);

  const otherParticipants =
    participants.filter(
      (participant) =>
        participant.id !==
        currentUserIdString
    );

  const directUser =
    otherParticipants[0] ?? participants[0] ?? null;

  const directPresence = directUser
    ? presenceMap.get(directUser.id)
    : null;

  return {
    id: String(
      conversation._id ?? conversation.id
    ),
    isGroup: Boolean(conversation.isGroup),
    groupName: conversation.groupName ?? "",
    groupAvatar: conversation.groupAvatar ?? "",
    name: conversation.isGroup
      ? conversation.groupName
      : directUser?.username ?? "Conversation",
    participants,
    admins,
    unreadCount: getUnreadCount(
      conversation.unreadCounts,
      currentUserId
    ),
    lastMessage: conversation.lastMessage
      ? {
          messageId: String(
            conversation.lastMessage.message ??
              ""
          ),
          senderId: String(
            conversation.lastMessage.sender ??
              ""
          ),
          content:
            conversation.lastMessage.content ?? "",
          attachmentsCount:
            conversation.lastMessage
              .attachmentsCount ?? 0,
          createdAt:
            conversation.lastMessage.createdAt ??
            null,
          status:
            conversation.lastMessage.status ??
            "sent",
        }
      : null,
    lastMessageAt:
      conversation.lastMessageAt ??
      conversation.updatedAt,
    online: conversation.isGroup
      ? false
      : Boolean(directPresence?.online),
    lastSeen: conversation.isGroup
      ? null
      : directPresence?.lastSeen ?? null,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
};
