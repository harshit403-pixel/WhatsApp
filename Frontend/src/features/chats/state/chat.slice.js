import { createSlice } from "@reduxjs/toolkit";

// Initial state for the chat slice, including conversations, messages, loading states, socket status, typing indicators, presence information, and error handling
const initialState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  loadingConversations: false,
  loadingMessagesByConversation: {},
  socketStatus: "disconnected", 
  typingByConversation: {},
  presenceByUser: {},
  error: null,
};

// Utility functions for sorting and managing conversations and messages

const sortConversations = (conversations = []) =>
  conversations.sort((left, right) => {
    const leftTime = new Date(
      left.lastMessageAt ??
        left.updatedAt ??
        left.createdAt ??
        0
    ).getTime();
    const rightTime = new Date(
      right.lastMessageAt ??
        right.updatedAt ??
        right.createdAt ??
        0
    ).getTime();

    return rightTime - leftTime;
  });

  // Sort messages by their creation time in ascending order
const sortMessages = (messages = []) =>
  messages.sort((left, right) => {
    const leftTime = new Date(
      left.createdAt ?? 0
    ).getTime();
    const rightTime = new Date(
      right.createdAt ?? 0
    ).getTime();

    return leftTime - rightTime;
  });

  // Find the index of a conversation in the conversations array by its ID

const findConversationIndex = (
  conversations,
  conversationId
) =>
  conversations.findIndex(
    (conversation) =>
      conversation.id === conversationId
  );


  // Upsert a conversation in the state, either adding it if it doesn't exist or updating it if it does
const upsertConversationInState = (
  state,
  incomingConversation
) => {
  if (!incomingConversation?.id) {
    return;
  }

  const conversationIndex =
    findConversationIndex(
      state.conversations,
      incomingConversation.id
    );

  if (conversationIndex === -1) {
    state.conversations.push(
      incomingConversation
    );
  } else {
    const existingConversation =
      state.conversations[conversationIndex];
    const incomingHasPresence =
      incomingConversation.online === true ||
      incomingConversation.lastSeen !== null &&
        incomingConversation.lastSeen !==
          undefined;

    state.conversations[conversationIndex] = {
      ...existingConversation,
      ...incomingConversation,
    };

    if (
      !incomingConversation.isGroup &&
      !incomingHasPresence
    ) {
      state.conversations[conversationIndex].online =
        existingConversation.online ?? false;
      state.conversations[
        conversationIndex
      ].lastSeen =
        existingConversation.lastSeen ??
        null;
    }
  }

  sortConversations(state.conversations);
};


// Update a conversation's last message and unread count based on a new message
const updateConversationFromMessage = (
  conversation,
  message,
  unreadCount
) => {
  conversation.lastMessage = {
    messageId: message.id,
    senderId: message.sender?.id ?? "",
    content: message.content ?? "",
    attachmentsCount:
      message.attachments?.length ?? 0,
    createdAt: message.createdAt,
    status: message.status,
  };
  conversation.lastMessageAt =
    message.createdAt;

  if (typeof unreadCount === "number") {
    conversation.unreadCount = unreadCount;
  }
};


// Upsert a message in a conversation's messages array, either adding it if it doesn't exist or updating it if it does
const upsertMessageInConversation = (
  messages = [],
  incomingMessage
) => {
  const messageIndex = messages.findIndex(
    (message) =>
      message.id === incomingMessage.id
  );

  if (messageIndex === -1) {
    messages.push(incomingMessage);
  } else {
    messages[messageIndex] = {
      ...messages[messageIndex],
      ...incomingMessage,
    };
  }

  sortMessages(messages);
};


// Redux slice for managing chat state, including conversations, messages, and related metadata
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversationsLoading: (
      state,
      action
    ) => {
      state.loadingConversations =
        action.payload;
    },

    setMessagesLoading: (state, action) => {
      const {
        conversationId,
        loading,
      } = action.payload;

      state.loadingMessagesByConversation[
        conversationId
      ] = loading;
    },

    setConversations: (state, action) => {
      state.conversations =
        sortConversations(
          action.payload ?? []
        );
    },

    upsertConversation: (state, action) => {
      upsertConversationInState(
        state,
        action.payload
      );
    },

    removeConversation: (state, action) => {
      const conversationId = action.payload;

      state.conversations =
        state.conversations.filter(
          (conversation) =>
            conversation.id !==
            conversationId
        );

      delete state.messagesByConversation[
        conversationId
      ];

      if (
        state.activeConversationId ===
        conversationId
      ) {
        state.activeConversationId =
          state.conversations[0]?.id ?? null;
      }
    },

    setActiveConversation: (state, action) => {
      state.activeConversationId =
        action.payload;
    },

    setMessages: (state, action) => {
      const {
        conversationId,
        messages,
      } = action.payload;

      state.messagesByConversation[
        conversationId
      ] = sortMessages([...(messages ?? [])]);
    },

    appendOptimisticMessage: (
      state,
      action
    ) => {
      const {
        conversationId,
        message,
      } = action.payload;

      if (
        !state.messagesByConversation[
          conversationId
        ]
      ) {
        state.messagesByConversation[
          conversationId
        ] = [];
      }

      state.messagesByConversation[
        conversationId
      ].push(message);
      sortMessages(
        state.messagesByConversation[
          conversationId
        ]
      );

      const conversationIndex =
        findConversationIndex(
          state.conversations,
          conversationId
        );

      if (conversationIndex !== -1) {
        updateConversationFromMessage(
          state.conversations[
            conversationIndex
          ],
          message,
          0
        );
        sortConversations(
          state.conversations
        );
      }
    },

    replaceOptimisticMessage: (
      state,
      action
    ) => {
      const {
        conversationId,
        tempId,
        message,
        conversation,
      } = action.payload;

      const messages =
        state.messagesByConversation[
          conversationId
        ] ?? [];

      const messageIndex = messages.findIndex(
        (entry) =>
          entry.id === tempId ||
          entry.clientTempId === tempId
      );

      if (messageIndex === -1) {
        messages.push(message);
      } else {
        messages[messageIndex] = message;
      }

      state.messagesByConversation[
        conversationId
      ] = sortMessages(messages);

      if (conversation) {
        upsertConversationInState(
          state,
          conversation
        );
      }
    },

    markOptimisticMessageFailed: (
      state,
      action
    ) => {
      const {
        conversationId,
        tempId,
      } = action.payload;

      const messages =
        state.messagesByConversation[
          conversationId
        ] ?? [];
      const messageIndex = messages.findIndex(
        (message) =>
          message.id === tempId ||
          message.clientTempId === tempId
      );

      if (messageIndex === -1) {
        return;
      }

      messages[messageIndex] = {
        ...messages[messageIndex],
        clientState: "failed",
      };
    },

    upsertMessage: (state, action) => {
      const {
        conversationId,
        message,
      } = action.payload;

      if (
        !state.messagesByConversation[
          conversationId
        ]
      ) {
        state.messagesByConversation[
          conversationId
        ] = [];
      }

      upsertMessageInConversation(
        state.messagesByConversation[
          conversationId
        ],
        message
      );
    },

    applyReceiptUpdates: (state, action) => {
      const {
        conversationId,
        messages,
      } = action.payload;

      if (
        !state.messagesByConversation[
          conversationId
        ]
      ) {
        state.messagesByConversation[
          conversationId
        ] = [];
      }

      for (const message of messages) {
        upsertMessageInConversation(
          state.messagesByConversation[
            conversationId
          ],
          message
        );
      }

      const conversationIndex =
        findConversationIndex(
          state.conversations,
          conversationId
        );

      if (conversationIndex === -1) {
        return;
      }

      for (const message of messages) {
        if (
          state.conversations[
            conversationIndex
          ].lastMessage?.messageId ===
          message.id
        ) {
          state.conversations[
            conversationIndex
          ].lastMessage.status =
            message.status;
        }
      }
    },

    setSocketStatus: (state, action) => {
      state.socketStatus =
        action.payload;
    },

    setPresence: (state, action) => {
      const {
        userId,
        online,
        lastSeen,
      } = action.payload;

      state.presenceByUser[userId] = {
        online,
        lastSeen: lastSeen ?? null,
      };

      for (const conversation of state.conversations) {
        if (
          conversation.isGroup ||
          !conversation.participants?.some(
            (participant) =>
              participant.id === userId
          )
        ) {
          continue;
        }

        conversation.online = online;
        conversation.lastSeen =
          lastSeen ?? null;
      }
    },

    setTypingState: (state, action) => {
      const {
        conversationId,
        userId,
        active,
      } = action.payload;

      if (
        !state.typingByConversation[
          conversationId
        ]
      ) {
        state.typingByConversation[
          conversationId
        ] = [];
      }

      const typingUsers =
        state.typingByConversation[
          conversationId
        ];

      if (active) {
        if (!typingUsers.includes(userId)) {
          typingUsers.push(userId);
        }
      } else {
        state.typingByConversation[
          conversationId
        ] = typingUsers.filter(
          (typingUserId) =>
            typingUserId !== userId
        );
      }
    },

    clearTypingState: (state, action) => {
      delete state.typingByConversation[
        action.payload
      ];
    },

    setConversationUnreadCount: (
      state,
      action
    ) => {
      const {
        conversationId,
        unreadCount,
      } = action.payload;

      const conversationIndex =
        findConversationIndex(
          state.conversations,
          conversationId
        );

      if (conversationIndex === -1) {
        return;
      }

      state.conversations[
        conversationIndex
      ].unreadCount = unreadCount;
    },

    setChatError: (state, action) => {
      state.error = action.payload;
    },

    clearChatState: () => ({
      ...initialState,
    }),
  },
});


// Export the action creators and reducer for use in the application
export const {
  setConversationsLoading,
  setMessagesLoading,
  setConversations,
  upsertConversation,
  removeConversation,
  setActiveConversation,
  setMessages,
  appendOptimisticMessage,
  replaceOptimisticMessage,
  markOptimisticMessageFailed,
  upsertMessage,
  applyReceiptUpdates,
  setSocketStatus,
  setPresence,
  setTypingState,
  clearTypingState,
  setConversationUnreadCount,
  setChatError,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
