import globalApi from "../../shared/global.api";

export const fetchConversations = async () => {
  const response = await globalApi.get(
    "/conversations"
  );

  return response.data.data ?? [];
};

export const fetchConversationMessages =
  async (conversationId) => {
    const response = await globalApi.get(
      `/conversations/${conversationId}/messages`
    );

    return response.data.data;
  };

export const getOrCreatePrivateConversation =
  async (targetUserId) => {
    const response = await globalApi.post(
      "/conversations/private",
      {
        targetUserId,
      }
    );

    return response.data.data;
  };

export const createGroupConversation =
  async ({
    groupName,
    memberIds,
  }) => {
    const response = await globalApi.post(
      "/conversations/group",
      {
        groupName,
        memberIds,
      }
    );

    return response.data.data;
  };

export const markConversationReadRequest =
  async (conversationId) => {
    const response = await globalApi.post(
      `/conversations/${conversationId}/read`
    );

    return response.data.data;
  };

export const renameGroupConversation =
  async ({
    conversationId,
    groupName,
  }) => {
    const response = await globalApi.patch(
      `/conversations/${conversationId}/group`,
      {
        groupName,
      }
    );

    return response.data.data;
  };

export const addGroupMembers = async ({
  conversationId,
  memberIds,
}) => {
  const response = await globalApi.post(
    `/conversations/${conversationId}/members`,
    {
      memberIds,
    }
  );

  return response.data.data;
};

export const removeGroupMember = async ({
  conversationId,
  memberId,
}) => {
  const response = await globalApi.delete(
    `/conversations/${conversationId}/members/${memberId}`
  );

  return response.data.data;
};

export const leaveGroupConversation =
  async (conversationId) => {
    const response = await globalApi.post(
      `/conversations/${conversationId}/leave`
    );

    return response.data.data;
  };
