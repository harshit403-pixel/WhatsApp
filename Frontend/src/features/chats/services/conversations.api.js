import globalApi from "../../shared/global.api";


export const fetchConversations = async () => {
  const response = await globalApi.get(
    "/conversations"
  );

  return response.data.data ?? [];
};

// Fetches messages for a specific conversation by its ID. Returns an object containing the conversation details and an array of messages.  
export const fetchConversationMessages =
  async (conversationId) => {
    const response = await globalApi.get(
      `/conversations/${conversationId}/messages`
    );

    return response.data.data;
  };

// Creates or retrieves a private conversation with a specific user. If a conversation already exists, it returns that conversation; otherwise, it creates a new one.
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

  // Creates a new group conversation with a specified name and a list of member IDs. Returns the newly created group conversation details.
export const createGroupConversation = async ({
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


  // Marks a specific conversation as read, indicating that the user has viewed the messages in that conversation. Returns the updated conversation details.
export const markConversationReadRequest =
  async (conversationId) => {
    const response = await globalApi.post(
      `/conversations/${conversationId}/read`
    );

    return response.data.data;
  };


  // Renames a group conversation with a specified ID and new name. Returns the updated conversation details.
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

  // Adds members to a group conversation with a specified ID. Returns the updated conversation details.
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

// Removes a member from a group conversation with a specified ID. Returns the updated conversation details.
export const removeGroupMember = async ({
  conversationId,
  memberId,
}) => {
  const response = await globalApi.delete(
    `/conversations/${conversationId}/members/${memberId}`
  );

  return response.data.data;
};

// Allows the current user to leave a group conversation with a specified ID. Returns the updated conversation details after the user has left the group.
export const leaveGroupConversation =
  async (conversationId) => {
    const response = await globalApi.post(
      `/conversations/${conversationId}/leave`
    );

    return response.data.data;
  };
