import * as conversationDao from "../dao/conversation.dao.js";
import * as messageDao from "../dao/message.dao.js";
import * as userDao from "../dao/user.dao.js";

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const hasReceipt = (receipts = [], userId) =>
  receipts.some(
    (receipt) =>
      String(receipt.user) === String(userId)
  );

const getRecipientIds = (
  conversation,
  senderId
) =>
  conversation.participants
    .map((participant) =>
      String(participant?._id ?? participant)
    )
    .filter(
      (participantId) =>
        participantId !== String(senderId)
    );

const resolveMessageStatus = (
  message,
  participantIds = []
) => {
  const recipientIds = participantIds.filter(
    (participantId) =>
      participantId !==
      String(message.sender?._id ?? message.sender)
  );

  if (!recipientIds.length) {
    return "sent";
  }

  const readUserIds = new Set(
    message.readBy.map((entry) =>
      String(entry.user)
    )
  );

  if (
    recipientIds.every((userId) =>
      readUserIds.has(userId)
    )
  ) {
    return "read";
  }

  const deliveredUserIds = new Set(
    message.deliveredTo.map((entry) =>
      String(entry.user)
    )
  );

  if (
    recipientIds.every((userId) =>
      deliveredUserIds.has(userId)
    )
  ) {
    return "delivered";
  }

  return "sent";
};

const ensureConversationMember = (
  conversation,
  userId
) => {
  if (!conversation) {
    throw createHttpError(
      404,
      "Conversation not found"
    );
  }

  const isMember =
    conversation.participants.some(
      (participant) =>
        String(participant?._id ?? participant) ===
        String(userId)
    );

  if (!isMember) {
    throw createHttpError(
      403,
      "You do not have access to this conversation"
    );
  }

  return conversation;
};

const ensureGroupAdmin = (
  conversation,
  userId
) => {
  if (!conversation.isGroup) {
    throw createHttpError(
      400,
      "This action is only available for groups"
    );
  }

  const isAdmin =
    conversation.admins.some(
      (admin) =>
        String(admin?._id ?? admin) ===
        String(userId)
    );

  if (!isAdmin) {
    throw createHttpError(
      403,
      "Only group admins can do that"
    );
  }
};

const syncConversationLastMessage = (
  conversation,
  message
) => {
  if (
    !conversation.lastMessage?.message ||
    String(conversation.lastMessage.message) !==
      String(message._id)
  ) {
    return;
  }

  conversation.lastMessage.status =
    message.status;
};

const updateConversationForNewMessage = (
  conversation,
  message,
  senderId
) => {
  const recipientIds = getRecipientIds(
    conversation,
    senderId
  );

  conversation.lastMessage = {
    message: message._id,
    sender: message.sender,
    content: message.content,
    createdAt: message.createdAt,
    status: message.status,
    attachmentsCount:
      message.attachments.length,
  };
  conversation.lastMessageAt =
    message.createdAt;

  conversation.unreadCounts.set(
    String(senderId),
    0
  );

  for (const recipientId of recipientIds) {
    const currentUnreadCount = Number(
      conversation.unreadCounts.get(recipientId) ?? 0
    );

    conversation.unreadCounts.set(
      recipientId,
      currentUnreadCount + 1
    );
  }
};

export const listPeerUserIds = async (
  userId
) => {
  const conversations =
    await conversationDao.listConversationPeers(
      userId
    );

  const peerIds = new Set();

  for (const conversation of conversations) {
    for (const participant of conversation.participants) {
      const participantId = String(
        participant
      );

      if (participantId !== String(userId)) {
        peerIds.add(participantId);
      }
    }
  }

  return [...peerIds];
};

export const listUserConversations = async (
  userId
) => {
  return conversationDao.listConversationsForUser(
    userId
  );
};

export const getConversationForUser = async (
  conversationId,
  userId
) => {
  const conversation =
    await conversationDao.getConversationById(
      conversationId
    );

  return ensureConversationMember(
    conversation,
    userId
  );
};

export const ensurePrivateConversation = async ({
  userId,
  targetUserId,
}) => {
  if (
    String(userId) === String(targetUserId)
  ) {
    throw createHttpError(
      400,
      "You cannot start a chat with yourself"
    );
  }

  const targetUser = await userDao.getUserById(
    targetUserId
  );

  if (!targetUser) {
    throw createHttpError(
      404,
      "Recipient not found"
    );
  }

  let conversation =
    await conversationDao.findPrivateConversationByParticipants(
      [userId, targetUserId]
    );

  if (!conversation) {
    conversation =
      await conversationDao.createConversation({
        participants: [userId, targetUserId],
        admins: [],
        unreadCounts: new Map([
          [String(userId), 0],
          [String(targetUserId), 0],
        ]),
      });

    conversation =
      await conversationDao.getConversationById(
        conversation._id
      );
  }

  return conversation;
};

export const createGroupConversation = async ({
  creatorId,
  groupName,
  memberIds = [],
}) => {
  const cleanGroupName = groupName?.trim();

  if (!cleanGroupName) {
    throw createHttpError(
      400,
      "Group name is required"
    );
  }

  const participantIds = [
    ...new Set(
      [creatorId, ...memberIds]
        .map((memberId) => String(memberId))
        .filter(Boolean)
    ),
  ];

  if (participantIds.length < 2) {
    throw createHttpError(
      400,
      "Add at least one member to create a group"
    );
  }

  const users = await userDao.getUsersByIds(
    participantIds
  );

  if (users.length !== participantIds.length) {
    throw createHttpError(
      400,
      "One or more group members were not found"
    );
  }

  const unreadCounts = new Map(
    participantIds.map((participantId) => [
      participantId,
      0,
    ])
  );

  let conversation =
    await conversationDao.createConversation({
      participants: participantIds,
      isGroup: true,
      groupName: cleanGroupName,
      admins: [creatorId],
      unreadCounts,
    });

  conversation =
    await conversationDao.getConversationById(
      conversation._id
    );

  return conversation;
};

export const getConversationMessages = async ({
  conversationId,
  userId,
}) => {
  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  const messages =
    await messageDao.listMessagesByConversation(
      conversationId
    );

  return {
    conversation,
    messages,
  };
};

export const sendConversationMessage = async ({
  senderId,
  conversationId,
  receiverId,
  content,
  attachments = [],
  deliveredUserIds = [],
}) => {
  const cleanContent = content?.trim() ?? "";

  let conversation = conversationId
    ? await getConversationForUser(
        conversationId,
        senderId
      )
    : await ensurePrivateConversation({
        userId: senderId,
        targetUserId: receiverId,
      });

  if (
    !cleanContent &&
    !attachments.length
  ) {
    throw createHttpError(
      400,
      "Message content or attachments are required"
    );
  }

  const message =
    await messageDao.createMessage({
      conversation: conversation._id,
      sender: senderId,
      content: cleanContent,
      attachments,
      readBy: [
        {
          user: senderId,
          at: new Date(),
        },
      ],
    });

  for (const deliveredUserId of deliveredUserIds) {
    if (
      !hasReceipt(
        message.deliveredTo,
        deliveredUserId
      )
    ) {
      message.deliveredTo.push({
        user: deliveredUserId,
        at: new Date(),
      });
    }
  }

  const participantIds =
    conversation.participants.map((participant) =>
      String(participant?._id ?? participant)
    );

  message.status = resolveMessageStatus(
    message,
    participantIds
  );

  await message.save();

  updateConversationForNewMessage(
    conversation,
    message,
    senderId
  );

  await conversation.save();

  conversation =
    await conversationDao.getConversationById(
      conversation._id
    );

  const populatedMessage =
    await messageDao.getMessageById(message._id);

  return {
    conversation,
    message: populatedMessage,
    recipientIds: getRecipientIds(
      conversation,
      senderId
    ),
  };
};

export const markConversationDelivered = async ({
  conversationId,
  userId,
}) => {
  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  const participantIds =
    conversation.participants.map((participant) =>
      String(participant?._id ?? participant)
    );

  const messages =
    await messageDao.listMessagesByConversation(
      conversationId
    );

  const updatedMessages = [];

  for (const message of messages) {
    if (
      String(message.sender?._id ?? message.sender) ===
      String(userId)
    ) {
      continue;
    }

    if (
      hasReceipt(message.deliveredTo, userId)
    ) {
      continue;
    }

    message.deliveredTo.push({
      user: userId,
      at: new Date(),
    });
    message.status = resolveMessageStatus(
      message,
      participantIds
    );

    await message.save();
    syncConversationLastMessage(
      conversation,
      message
    );

    updatedMessages.push(
      await messageDao.getMessageById(
        message._id
      )
    );
  }

  if (updatedMessages.length) {
    await conversation.save();
  }

  return {
    conversation,
    messages: updatedMessages,
    recipientIds: getRecipientIds(
      conversation,
      userId
    ),
  };
};

export const markConversationRead = async ({
  conversationId,
  userId,
}) => {
  const deliveryResult =
    await markConversationDelivered({
      conversationId,
      userId,
    });

  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  const participantIds =
    conversation.participants.map((participant) =>
      String(participant?._id ?? participant)
    );

  const messages =
    await messageDao.listMessagesByConversation(
      conversationId
    );

  const updatedMessages = [
    ...deliveryResult.messages,
  ];
  const seenMessageIds = new Set(
    updatedMessages.map((message) =>
      String(message._id ?? message.id)
    )
  );

  for (const message of messages) {
    if (
      String(message.sender?._id ?? message.sender) ===
      String(userId)
    ) {
      continue;
    }

    if (hasReceipt(message.readBy, userId)) {
      continue;
    }

    if (!hasReceipt(message.deliveredTo, userId)) {
      message.deliveredTo.push({
        user: userId,
        at: new Date(),
      });
    }

    message.readBy.push({
      user: userId,
      at: new Date(),
    });
    message.status = resolveMessageStatus(
      message,
      participantIds
    );

    await message.save();
    syncConversationLastMessage(
      conversation,
      message
    );

    const populatedMessage =
      await messageDao.getMessageById(
        message._id
      );

    if (
      !seenMessageIds.has(
        String(populatedMessage._id)
      )
    ) {
      updatedMessages.push(populatedMessage);
      seenMessageIds.add(
        String(populatedMessage._id)
      );
    }
  }

  conversation.unreadCounts.set(
    String(userId),
    0
  );

  await conversation.save();

  return {
    conversation:
      await conversationDao.getConversationById(
        conversation._id
      ),
    messages: updatedMessages,
    recipientIds: getRecipientIds(
      conversation,
      userId
    ),
  };
};

export const renameGroupConversation = async ({
  conversationId,
  userId,
  groupName,
}) => {
  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  ensureGroupAdmin(conversation, userId);

  const cleanGroupName = groupName?.trim();

  if (!cleanGroupName) {
    throw createHttpError(
      400,
      "Group name is required"
    );
  }

  conversation.groupName = cleanGroupName;
  await conversation.save();

  return conversationDao.getConversationById(
    conversation._id
  );
};

export const addGroupMembersToConversation = async ({
  conversationId,
  userId,
  memberIds = [],
}) => {
  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  ensureGroupAdmin(conversation, userId);

  const existingParticipantIds =
    new Set(
      conversation.participants.map((participant) =>
        String(participant?._id ?? participant)
      )
    );

  const uniqueMemberIds = [
    ...new Set(
      memberIds
        .map((memberId) => String(memberId))
        .filter(Boolean)
    ),
  ].filter(
    (memberId) =>
      !existingParticipantIds.has(memberId)
  );

  if (!uniqueMemberIds.length) {
    throw createHttpError(
      400,
      "No new members were selected"
    );
  }

  const users = await userDao.getUsersByIds(
    uniqueMemberIds
  );

  if (users.length !== uniqueMemberIds.length) {
    throw createHttpError(
      400,
      "One or more users were not found"
    );
  }

  for (const memberId of uniqueMemberIds) {
    conversation.participants.push(memberId);
    conversation.unreadCounts.set(memberId, 0);
  }

  await conversation.save();

  return conversationDao.getConversationById(
    conversation._id
  );
};

export const removeGroupMemberFromConversation = async ({
  conversationId,
  userId,
  memberId,
}) => {
  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  ensureGroupAdmin(conversation, userId);

  if (
    String(userId) === String(memberId)
  ) {
    throw createHttpError(
      400,
      "Use the leave group action to remove yourself"
    );
  }

  const existingParticipantIds =
    conversation.participants.map((participant) =>
      String(participant?._id ?? participant)
    );

  if (
    !existingParticipantIds.includes(
      String(memberId)
    )
  ) {
    throw createHttpError(
      404,
      "Member not found in this group"
    );
  }

  conversation.participants =
    conversation.participants.filter(
      (participant) =>
        String(participant?._id ?? participant) !==
        String(memberId)
    );
  conversation.admins = conversation.admins.filter(
    (admin) =>
      String(admin?._id ?? admin) !==
      String(memberId)
  );
  conversation.unreadCounts.delete(
    String(memberId)
  );

  if (
    !conversation.admins.length &&
    conversation.participants.length
  ) {
    conversation.admins = [
      conversation.participants[0],
    ];
  }

  await conversation.save();

  return conversationDao.getConversationById(
    conversation._id
  );
};

export const leaveGroupConversation = async ({
  conversationId,
  userId,
}) => {
  const conversation =
    await getConversationForUser(
      conversationId,
      userId
    );

  if (!conversation.isGroup) {
    throw createHttpError(
      400,
      "Only group conversations can be left"
    );
  }

  conversation.participants =
    conversation.participants.filter(
      (participant) =>
        String(participant?._id ?? participant) !==
        String(userId)
    );
  conversation.admins = conversation.admins.filter(
    (admin) =>
      String(admin?._id ?? admin) !==
      String(userId)
  );
  conversation.unreadCounts.delete(
    String(userId)
  );

  if (
    !conversation.admins.length &&
    conversation.participants.length
  ) {
    conversation.admins = [
      conversation.participants[0],
    ];
  }

  await conversation.save();

  return conversationDao.getConversationById(
    conversation._id
  );
};
