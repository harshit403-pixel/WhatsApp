// Helper functions for chat-related operations, such as formatting message times, determining conversation peers, and building conversation previews.
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

// Format the last seen time of a user, returning "Offline" if the value is invalid or not provided, otherwise returning a formatted string indicating the last seen date and time.
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


// Get the peer (other participant) of a conversation, excluding the current user. If no other participant is found, return the first participant or null.
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


  // Build a typing label for a conversation based on the users who are currently typing. If there are no typing users, return an empty string. If there is one typing user, return a message indicating that the user is typing. If there are multiple typing users, return a message indicating that one user and additional users are typing.
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

// Build a conversation preview string based on the last message, typing state, and other relevant information. If there is a typing label, return it. If there is no last message, return a default message. If the last message has attachments, return a message indicating the number of attachments. If the last message was sent by another participant in a group conversation, include the sender's name in the preview. Otherwise, return the content of the last message or a default message.
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
