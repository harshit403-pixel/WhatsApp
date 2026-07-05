export const formatMessageTime = (
  value,
  options = {
    hour: "numeric",
    minute: "2-digit",
  }
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    options
  ).format(date);
};

export const formatLastSeen = (value) => {
  if (!value) {
    return "Offline";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Offline";
  }

  return `Last seen ${new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)}`;
};

export const getConversationPeer = (
  conversation,
  currentUserId
) =>
  conversation?.participants?.find(
    (participant) =>
      participant.id !== currentUserId
  ) ??
  conversation?.participants?.[0] ??
  null;

export const buildTypingLabel = (
  conversation,
  typingUserIds = []
) => {
  const typingNames = typingUserIds
    .map((userId) =>
      conversation?.participants?.find(
        (participant) =>
          participant.id === userId
      )?.username
    )
    .filter(Boolean);

  if (!typingNames.length) {
    return "";
  }

  if (typingNames.length === 1) {
    return `${typingNames[0]} is typing...`;
  }

  return `${typingNames[0]} and ${typingNames.length - 1} more are typing...`;
};

export const buildConversationPreview = ({
  conversation,
  currentUserId,
  typingLabel,
}) => {
  if (typingLabel) {
    return typingLabel;
  }

  const lastMessage =
    conversation.lastMessage;

  if (!lastMessage) {
    return "Start the conversation";
  }

  if (lastMessage.attachmentsCount) {
    return `${lastMessage.attachmentsCount} attachment${
      lastMessage.attachmentsCount > 1
        ? "s"
        : ""
    }`;
  }

  if (
    conversation.isGroup &&
    lastMessage.senderId &&
    lastMessage.senderId !== currentUserId
  ) {
    const senderName =
      conversation.participants?.find(
        (participant) =>
          participant.id ===
          lastMessage.senderId
      )?.username;

    if (senderName) {
      return `${senderName}: ${lastMessage.content}`;
    }
  }

  return lastMessage.content || "New message";
};
