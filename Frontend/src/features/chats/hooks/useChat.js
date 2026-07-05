import { useDispatch, useSelector } from "react-redux";

import {
  addGroupMembers,
  createGroupConversation,
  fetchConversationMessages,
  fetchConversations,
  getOrCreatePrivateConversation,
  leaveGroupConversation,
  markConversationReadRequest,
  removeGroupMember,
  renameGroupConversation,
} from "../services/conversations.api";
import { getChatSocket } from "../services/socket.client";
import {
  appendOptimisticMessage,
  applyReceiptUpdates,
  markOptimisticMessageFailed,
  removeConversation,
  replaceOptimisticMessage,
  setActiveConversation,
  setChatError,
  setConversations,
  setConversationsLoading,
  setConversationUnreadCount,
  setMessages,
  setMessagesLoading,
  upsertConversation,
} from "../state/chat.slice";
import { appToast } from "../../shared/lib/toast";

// Helper function to create a temporary message object for optimistic UI updates when sending messages. 
const createTemporaryMessage = ({
  content,
  conversationId,
  currentUser,
}) => {
  const tempId = `temp-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return {
    id: tempId,
    clientTempId: tempId,
    conversationId,
    sender: currentUser,
    content,
    attachments: [],
    status: "sending",
    deliveredTo: [],
    readBy: [
      {
        userId: currentUser.id,
        at: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Custom React hook for managing chat-related state and actions, including loading conversations, sending messages, and handling typing indicators.
const useChat = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state) => state.auth.user
  );
  const {
    activeConversationId,
    conversations,
    messagesByConversation,
    socketStatus,
    typingByConversation,
    loadingConversations,
    loadingMessagesByConversation,
  } = useSelector((state) => state.chat);

  const loadConversations = async () => {
    try {
      dispatch(setConversationsLoading(true));
      dispatch(setChatError(null));

      const items = await fetchConversations();

      dispatch(setConversations(items));

      return items;
    } catch (error) {
      dispatch(
        setChatError(
          error.response?.data?.message ??
            "Unable to load conversations"
        )
      );

      appToast.error(
        "Unable to load conversations",
        "Please refresh the page or try again in a moment."
      );

      return [];
    } finally {
      dispatch(setConversationsLoading(false));
    }
  };

  const loadConversationMessages = async (
    conversationId
  ) => {
    if (!conversationId) {
      return null;
    }

    try {
      dispatch(
        setMessagesLoading({
          conversationId,
          loading: true,
        })
      );

      const data =
        await fetchConversationMessages(
          conversationId
        );

      dispatch(
        setMessages({
          conversationId,
          messages: data.messages,
        })
      );
      dispatch(
        upsertConversation(data.conversation)
      );

      const socket = getChatSocket();

      socket?.emit("message:delivered", {
        conversationId,
      });

      return data;
    } catch (error) {
      appToast.error(
        "Unable to load messages",
        error.response?.data?.message ??
          "Please try again."
      );

      return null;
    } finally {
      dispatch(
        setMessagesLoading({
          conversationId,
          loading: false,
        })
      );
    }
  };

  const openPrivateConversation =
    async (targetUserId) => {
      try {
        const conversation =
          await getOrCreatePrivateConversation(
            targetUserId
          );
        const hasExistingConversation =
          conversations.some(
            (item) =>
              item.id === conversation.id
          );

        dispatch(upsertConversation(conversation));
        dispatch(
          setActiveConversation(
            conversation.id
          )
        );

        if (!hasExistingConversation) {
          void loadConversations();
        }

        return conversation;
      } catch (error) {
        appToast.error(
          "Unable to open conversation",
          error.response?.data?.message ??
            "Please try again."
        );

        return null;
      }
    };

  const createGroup = async ({
    groupName,
    memberIds,
  }) => {
    const conversation =
      await createGroupConversation({
        groupName,
        memberIds,
      });

    dispatch(upsertConversation(conversation));
    dispatch(
      setActiveConversation(conversation.id)
    );

    return conversation;
  };

  const renameGroup = async ({
    conversationId,
    groupName,
  }) => {
    const conversation =
      await renameGroupConversation({
        conversationId,
        groupName,
      });

    dispatch(upsertConversation(conversation));

    return conversation;
  };

  const addMembersToGroup = async ({
    conversationId,
    memberIds,
  }) => {
    const conversation =
      await addGroupMembers({
        conversationId,
        memberIds,
      });

    dispatch(upsertConversation(conversation));

    return conversation;
  };

  const removeMemberFromGroup = async ({
    conversationId,
    memberId,
  }) => {
    const conversation =
      await removeGroupMember({
        conversationId,
        memberId,
      });

    dispatch(upsertConversation(conversation));

    return conversation;
  };

  const leaveGroup = async (conversationId) => {
    await leaveGroupConversation(
      conversationId
    );
    dispatch(removeConversation(conversationId));
  };

  const markConversationRead = async (
    conversationId
  ) => {
    if (!conversationId) {
      return;
    }

    try {
      const data =
        await markConversationReadRequest(
          conversationId
        );

      dispatch(
        upsertConversation(data.conversation)
      );
      dispatch(
        setConversationUnreadCount({
          conversationId,
          unreadCount: 0,
        })
      );
      dispatch(
        applyReceiptUpdates({
          conversationId,
          messages: data.messages,
        })
      );
    } catch (error) {
      appToast.error(
        "Unable to update read state",
        error.response?.data?.message ??
          "Please try again."
      );
    }
  };

  const sendMessage = async ({
    conversationId,
    receiverId,
    content,
  }) => {
    const socket = getChatSocket();

    if (!socket) {
      appToast.error(
        "Socket is not connected",
        "Please wait for the connection to recover."
      );
      return;
    }

    const optimisticMessage =
      createTemporaryMessage({
        content,
        conversationId,
        currentUser,
      });

    dispatch(
      appendOptimisticMessage({
        conversationId,
        message: optimisticMessage,
      })
    );

    socket.emit(
      "message:send",
      {
        conversationId,
        receiverId,
        content,
      },
      (response) => {
        if (!response?.ok) {
          dispatch(
            markOptimisticMessageFailed({
              conversationId,
              tempId:
                optimisticMessage.clientTempId,
            })
          );
          appToast.error(
            "Message failed to send",
            response?.message ??
              "Please try again."
          );
          return;
        }

        dispatch(
          replaceOptimisticMessage({
            conversationId,
            tempId:
              optimisticMessage.clientTempId,
            message:
              response.data.message,
            conversation:
              response.data.conversation,
          })
        );
      }
    );
  };

  const emitTypingStart = (
    conversationId
  ) => {
    const socket = getChatSocket();

    if (!socket || !conversationId) {
      return;
    }

    socket.emit("typing:start", {
      conversationId,
    });
  };

  const emitTypingStop = (
    conversationId
  ) => {
    const socket = getChatSocket();

    if (!socket || !conversationId) {
      return;
    }

    socket.emit("typing:stop", {
      conversationId,
    });
  };

  return {
    activeConversationId,
    conversations,
    currentUser,
    loadingConversations,
    loadingMessagesByConversation,
    messagesByConversation,
    socketStatus,
    typingByConversation,
    setActiveConversation: (conversationId) =>
      dispatch(
        setActiveConversation(conversationId)
      ),
    loadConversations,
    loadConversationMessages,
    openPrivateConversation,
    createGroup,
    renameGroup,
    addMembersToGroup,
    removeMemberFromGroup,
    leaveGroup,
    markConversationRead,
    sendMessage,
    emitTypingStart,
    emitTypingStop,
  };
};

export default useChat;
