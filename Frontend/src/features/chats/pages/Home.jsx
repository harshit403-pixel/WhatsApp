import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  MessageSquareMore,
  PhoneCall,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router";

import useAuth from "../../auth/hooks/useAuth";
import useChat from "../hooks/useChat";
import {
  buildConversationPreview,
  buildTypingLabel,
  formatLastSeen,
  formatMessageTime,
  getConversationPeer,
} from "../lib/chat-helpers";
import ChatHeader from "../../shared/components/ChatHeader";
import ChatList from "../../shared/components/ChatList";
import CreateGroupModal from "../../shared/components/CreateGroupModal";
import GroupInfoDrawer from "../../shared/components/GroupInfoDrawer";
import MessageBubble from "../../shared/components/MessageBubble";
import MessageInput from "../../shared/components/MessageInput";
import ProfileDrawer from "../../shared/components/ProfileDrawer";
import SearchUsersModal from "../../shared/components/SearchUsersModal";
import SettingsModal from "../../shared/components/SettingsModal";
import Sidebar from "../../shared/components/Sidebar";
import { Button } from "../../shared/components/ui/Button";
import EmptyState from "../../shared/components/ui/EmptyState";
import Skeleton from "../../shared/components/ui/Skeleton";
import { appToast } from "../../shared/lib/toast";

const UI_PREFERENCES_KEY = "whatsapp:ui-preferences";

const defaultPreferences = {
  compactList: false,
  enterToSend: true,
  showEmailPreview: true,
  reducedMotion: false,
};

const readStoredPreferences = () => {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const value = window.localStorage.getItem(
      UI_PREFERENCES_KEY
    );
    const parsed = JSON.parse(value ?? "{}");

    return {
      ...defaultPreferences,
      ...(parsed && typeof parsed === "object"
        ? parsed
        : {}),
    };
  } catch {
    return defaultPreferences;
  }
};

const resolveEntryId = (entry) =>
  entry?.id ?? entry?._id ?? entry?.userId ?? "";

const Home = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    activeConversationId,
    conversations,
    currentUser,
    loadingConversations,
    loadingMessagesByConversation,
    messagesByConversation,
    socketStatus,
    typingByConversation,
    setActiveConversation,
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
  } = useChat();

  const [chatFilter, setChatFilter] = useState("");
  const deferredChatFilter =
    useDeferredValue(chatFilter);
  const [composerValue, setComposerValue] =
    useState("");
  const [preferences, setPreferences] = useState(
    readStoredPreferences
  );
  const [isSearchOpen, setIsSearchOpen] =
    useState(false);
  const [groupModalState, setGroupModalState] =
    useState({
      open: false,
      mode: "create",
    });
  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);
  const [isListDrawerOpen, setIsListDrawerOpen] =
    useState(false);
  const [profileState, setProfileState] = useState({
    open: false,
    mode: "account",
    user: null,
  });
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] =
    useState(false);
  const typingActiveRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const readSyncRef = useRef({
    conversationId: null,
    pending: false,
  });

  useEffect(() => {
    window.localStorage.setItem(
      UI_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
  }, [preferences]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (
      socketStatus === "connected" ||
      !conversations.length
    ) {
      loadConversations();
    }

    // The hook helpers are intentionally not memoized so this page stays easy
    // to read. We only resync when user identity or socket state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, socketStatus]);

  useEffect(() => {
    if (
      !activeConversationId &&
      conversations.length
    ) {
      setActiveConversation(conversations[0].id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!activeConversationId) {
      return undefined;
    }

    const syncConversation = async () => {
      await loadConversationMessages(
        activeConversationId
      );
    };

    syncConversation();

    return () => {
      readSyncRef.current = {
        conversationId: null,
        pending: false,
      };
      emitTypingStop(activeConversationId);
      typingActiveRef.current = false;
      window.clearTimeout(
        typingTimeoutRef.current
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    if (!composerValue.trim()) {
      if (typingActiveRef.current) {
        emitTypingStop(activeConversationId);
        typingActiveRef.current = false;
      }

      window.clearTimeout(
        typingTimeoutRef.current
      );
      return;
    }

    if (!typingActiveRef.current) {
      emitTypingStart(activeConversationId);
      typingActiveRef.current = true;
    }

    window.clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      window.setTimeout(() => {
        emitTypingStop(activeConversationId);
        typingActiveRef.current = false;
      }, 1200);

    return () => {
      window.clearTimeout(
        typingTimeoutRef.current
      );
    };
  }, [
    activeConversationId,
    composerValue,
    emitTypingStart,
    emitTypingStop,
  ]);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        activeConversationId
    ) ?? null;

  const activeMessages =
    messagesByConversation[
      selectedConversation?.id ?? ""
    ] ?? [];

  const hasUnreadIncomingMessages =
    Boolean(selectedConversation) &&
    activeMessages.some((message) => {
      if (
        message.sender?.id === currentUser?.id
      ) {
        return false;
      }

      return !message.readBy?.some(
        (entry) =>
          entry.userId === currentUser?.id
      );
    });

  useEffect(() => {
    if (
      !activeConversationId ||
      !currentUser?.id ||
      !hasUnreadIncomingMessages
    ) {
      return;
    }

    if (
      typeof document !== "undefined" &&
      document.visibilityState !== "visible"
    ) {
      return;
    }

    if (
      readSyncRef.current.pending &&
      readSyncRef.current.conversationId ===
        activeConversationId
    ) {
      return;
    }

    readSyncRef.current = {
      conversationId: activeConversationId,
      pending: true,
    };

    void (async () => {
      try {
        await markConversationRead(
          activeConversationId
        );
      } finally {
        if (
          readSyncRef.current.conversationId ===
          activeConversationId
        ) {
          readSyncRef.current = {
            conversationId:
              activeConversationId,
            pending: false,
          };
        }
      }
    })();
  }, [
    activeConversationId,
    currentUser?.id,
    hasUnreadIncomingMessages,
    markConversationRead,
  ]);

  useEffect(() => {
    if (!activeConversationId) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState !==
          "visible" ||
        !hasUnreadIncomingMessages
      ) {
        return;
      }

      if (
        readSyncRef.current.pending &&
        readSyncRef.current.conversationId ===
          activeConversationId
      ) {
        return;
      }

      readSyncRef.current = {
        conversationId: activeConversationId,
        pending: true,
      };

      void (async () => {
        try {
          await markConversationRead(
            activeConversationId
          );
        } finally {
          if (
            readSyncRef.current
              .conversationId ===
            activeConversationId
          ) {
            readSyncRef.current = {
              conversationId:
                activeConversationId,
              pending: false,
            };
          }
        }
      })();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    activeConversationId,
    hasUnreadIncomingMessages,
    markConversationRead,
  ]);

  const typingLabelByConversation = {};

  for (const conversation of conversations) {
    const typingUserIds = (
      typingByConversation[conversation.id] ?? []
    ).filter(
      (userId) =>
        userId !== currentUser?.id
    );

    typingLabelByConversation[
      conversation.id
    ] = buildTypingLabel(
      conversation,
      typingUserIds
    );
  }

  const chatCards = conversations
    .map((conversation) => {
      const peer = getConversationPeer(
        conversation,
        currentUser?.id
      );
      const typingLabel =
        typingLabelByConversation[
          conversation.id
        ] ?? "";

      return {
        ...conversation,
        username: conversation.name,
        email: conversation.isGroup
          ? `${conversation.participants.length} members`
          : peer?.email ?? "",
        preview: buildConversationPreview({
          conversation,
          currentUserId: currentUser?.id,
          typingLabel,
        }),
        unreadCount:
          conversation.unreadCount,
        lastOpenedAt:
          conversation.lastMessageAt,
        online: conversation.online,
        isTyping: Boolean(typingLabel),
      };
    })
    .filter((chat) => {
      const query = deferredChatFilter
        .trim()
        .toLowerCase();

      if (!query) {
        return true;
      }

      return [
        chat.username,
        chat.email,
        chat.preview,
      ]
        .filter(Boolean)
        .some((value) =>
          value
            .toLowerCase()
            .includes(query)
        );
    });

  const selectedChatCard =
    chatCards.find(
      (chat) =>
        chat.id ===
        selectedConversation?.id
    ) ?? null;
  const activeTypingLabel =
    selectedConversation
      ? typingLabelByConversation[
          selectedConversation.id
        ]
      : "";
  const isMessagesLoading =
    loadingMessagesByConversation[
      selectedConversation?.id ?? ""
    ];

  const transition = preferences.reducedMotion
    ? { duration: 0 }
    : { duration: 0.22 };

  const openAccountDrawer = () => {
    setProfileState({
      open: true,
      mode: "account",
      user: currentUser,
    });
  };

  const openContactDrawer = () => {
    if (!selectedConversation) {
      return;
    }

    const peer = getConversationPeer(
      selectedConversation,
      currentUser?.id
    );

    setProfileState({
      open: true,
      mode: "contact",
      user: peer,
    });
  };

  const handleSelectUser = async (entry) => {
    const conversation =
      await openPrivateConversation(
        resolveEntryId(entry)
      );

    if (!conversation) {
      return;
    }

    setComposerValue("");
    setIsListDrawerOpen(false);
    setIsSearchOpen(false);
    appToast.success(
      `Opened ${conversation.name}`,
      "Chat opened."
    );
  };

  const handleSelectChat = (chat) => {
    setActiveConversation(chat.id);
    setComposerValue("");
    setIsListDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      appToast.success(
        "Signed out",
        "Your session ended successfully."
      );
      navigate("/login");
    } catch (error) {
      appToast.error(
        error.response?.data?.message ||
          "Unable to sign out",
        "Please try again."
      );
    }
  };

  const handleCopyEmail = async () => {
    const email = profileState.user?.email;

    if (!email) {
      appToast.warning(
        "No email available",
        "There is nothing to copy for this profile."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      appToast.success(
        "Email copied",
        `${email} is now on your clipboard.`
      );
    } catch {
      appToast.error(
        "Copy failed",
        "Clipboard access is not available here."
      );
    }
  };

  const handlePreferenceChange = (
    key,
    value
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleClearRecentChats = () => {
    appToast.info(
     "No local chats to clear."
    );
  };

  const stopTypingNow = () => {
    if (!activeConversationId) {
      return;
    }

    emitTypingStop(activeConversationId);
    typingActiveRef.current = false;
    window.clearTimeout(
      typingTimeoutRef.current
    );
  };

  const handleComposerSubmit = async () => {
    if (
      !composerValue.trim() ||
      !selectedConversation
    ) {
      return;
    }

    const messageContent =
      composerValue.trim();

    setComposerValue("");
    stopTypingNow();

    await sendMessage({
      conversationId:
        selectedConversation.id,
      receiverId:
        selectedConversation.isGroup
          ? null
          : getConversationPeer(
              selectedConversation,
              currentUser?.id
            )?.id,
      content: messageContent,
    });
  };

  const handleCallAttempt = () => {
    appToast.info(
      "Call action UI only",
      "A call transport contract is not exposed in this frontend yet."
    );
  };

  const handleEmojiAttempt = () => {
    appToast.info(
      "Emoji picker placeholder",
      "The composer is ready for an emoji picker without needing layout changes."
    );
  };

  const handleAttachmentAttempt = () => {
    appToast.info(
      "Attachments are not connected",
      "No upload flow is exposed in the current frontend contract."
    );
  };

  const handleCreateGroup = async ({
    name,
    members,
  }) => {
    try {
      const conversation =
        await createGroup({
          groupName: name,
          memberIds: members.map(
            (member) =>
              resolveEntryId(member)
          ),
        });

      setGroupModalState({
        open: false,
        mode: "create",
      });

      appToast.success(
        `Created ${conversation.name}`,
       "Group created successfully."
      );
    } catch (error) {
      appToast.error(
        "Unable to create group",
        error.response?.data?.message ??
          "Please try again."
      );
    }
  };

  const handleAddMembers = async ({
    members,
  }) => {
    if (!selectedConversation) {
      return;
    }

    try {
      await addMembersToGroup({
        conversationId:
          selectedConversation.id,
        memberIds: members.map(
          (member) =>
            resolveEntryId(member)
        ),
      });

      setGroupModalState({
        open: false,
        mode: "addMembers",
      });

      appToast.success(
        "Members added successfully."
      );
    } catch (error) {
      appToast.error(
        "Unable to add members",
        error.response?.data?.message ??
          "Please try again."
      );
    }
  };

  const handleRenameGroup = async (
    nextGroupName
  ) => {
    if (!selectedConversation) {
      return;
    }

    try {
      await renameGroup({
        conversationId:
          selectedConversation.id,
        groupName: nextGroupName,
      });

      appToast.success(
        "Group renamed successfully."
      );
    } catch (error) {
      appToast.error(
        "Unable to rename group",
        error.response?.data?.message ??
          "Please try again."
      );
    }
  };

  const handleRemoveMember = async (
    memberId
  ) => {
    if (!selectedConversation) {
      return;
    }

    try {
      await removeMemberFromGroup({
        conversationId:
          selectedConversation.id,
        memberId,
      });

      appToast.success(
        "Member removed",
        "The group roster updated in real time."
      );
    } catch (error) {
      appToast.error(
        "Unable to remove member",
        error.response?.data?.message ??
          "Please try again."
      );
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedConversation) {
      return;
    }

    try {
      const groupName =
        selectedConversation.name;

      await leaveGroup(
        selectedConversation.id
      );

      setIsGroupDrawerOpen(false);
      appToast.success(
        "Left group",
        `${groupName} was removed from your conversation list.`
      );
    } catch (error) {
      appToast.error(
        "Unable to leave group",
        error.response?.data?.message ??
          "Please try again."
      );
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="relative h-[100dvh] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_25%)]" />

      <div className="relative flex h-full min-h-0 overflow-hidden">
        <Sidebar
          user={currentUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={openAccountDrawer}
          onOpenGroups={() =>
            setGroupModalState({
              open: true,
              mode: "create",
            })
          }
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4 md:p-5">
          <div className="glass-panel mb-4 shrink-0 flex items-center justify-between rounded-[1.7rem] px-4 py-3 md:hidden">
            <div>
              <p className="text-sm font-semibold text-white">
                {currentUser?.username || "Workspace"}
              </p>
              <p className="text-xs text-zinc-500">
                {socketStatus === "connected"
                  ? "Real-time connection active"
                  : socketStatus === "connecting"
                  ? "Connecting to chat server..."
                  : "Reconnecting to chat server..."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search users"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-xl"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open settings"
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-xl"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open profile"
                onClick={openAccountDrawer}
                className="rounded-xl"
              >
                <UserRound className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
            <div className="hidden h-full min-h-0 w-[340px] shrink-0 lg:block">
              <ChatList
                chats={chatCards}
                activeChatId={
                  activeConversationId
                }
                filterValue={chatFilter}
                onFilterChange={setChatFilter}
                onSelectChat={handleSelectChat}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenGroups={() =>
                  setGroupModalState({
                    open: true,
                    mode: "create",
                  })
                }
                compact={preferences.compactList}
                showEmailPreview={
                  preferences.showEmailPreview
                }
              />
            </div>

            <section className="glass-panel-strong flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem]">
              {selectedConversation ? (
                <>
                  <ChatHeader
                    chat={{
                      ...selectedChatCard,
                      username:
                        selectedConversation.name,
                      email:
                        selectedConversation.isGroup
                          ? activeTypingLabel ||
                            `${selectedConversation.participants.length} members`
                          : selectedConversation.online
                          ? "Online now"
                          : formatLastSeen(
                              selectedConversation.lastSeen
                            ),
                    }}
                    onOpenList={() =>
                      setIsListDrawerOpen(true)
                    }
                    onOpenProfile={() => {
                      if (
                        selectedConversation.isGroup
                      ) {
                        setIsGroupDrawerOpen(true);
                        return;
                      }

                      openContactDrawer();
                    }}
                    onStartCall={handleCallAttempt}
                    showCallAction={
                      !selectedConversation.isGroup
                    }
                    menuItems={
                      selectedConversation.isGroup
                        ? [
                            {
                              label:
                                "View group info",
                              icon: UsersRound,
                              onSelect: () =>
                                setIsGroupDrawerOpen(
                                  true
                                ),
                            },
                            {
                              label:
                                "Add members",
                              icon: UsersRound,
                              onSelect: () =>
                                setGroupModalState({
                                  open: true,
                                  mode: "addMembers",
                                }),
                            },
                          ]
                        : [
                            {
                              label:
                                "View profile",
                              icon: UserRound,
                              onSelect:
                                openContactDrawer,
                            },
                            {
                              label:
                                "Start call",
                              icon: PhoneCall,
                              onSelect:
                                handleCallAttempt,
                            },
                            {
                              label:
                                "Create group with contact",
                              icon: UsersRound,
                              onSelect: () =>
                                setGroupModalState({
                                  open: true,
                                  mode: "create",
                                }),
                            },
                          ]
                    }
                  />

                  <div className="app-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="mx-auto flex max-w-2xl flex-col gap-4">
                     

                      {isMessagesLoading &&
                      !activeMessages.length ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((item) => (
                            <Skeleton
                              key={item}
                              className="h-16 w-full rounded-[1.65rem]"
                            />
                          ))}
                        </div>
                      ) : activeMessages.length ? (
                        activeMessages.map(
                          (message) => {
                            const isOutgoing =
                              message.sender?.id ===
                              currentUser?.id;

                            return (
                              <MessageBubble
                                key={message.id}
                                variant={
                                  isOutgoing
                                    ? "outgoing"
                                    : "incoming"
                                }
                                senderName={
                                  selectedConversation.isGroup &&
                                  !isOutgoing
                                    ? message.sender
                                        ?.username
                                    : null
                                }
                                text={
                                  message.content ||
                                  "Attachment message"
                                }
                                timestamp={formatMessageTime(
                                  message.createdAt
                                )}
                                deliveryState={
                                  isOutgoing
                                    ? message.status
                                    : undefined
                                }
                                clientState={
                                  message.clientState
                                }
                              />
                            );
                          }
                        )
                      ) : (
                        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
                          <div className="flex items-start gap-3">
                            <MessageSquareMore className="mt-0.5 h-5 w-5 text-emerald-300" />
                            <div>
                              <p className="text-sm font-semibold text-white">
                                "No messages yet. Send the first message."
                              </p>
                    
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTypingLabel ? (
                        <MessageBubble
                          variant="system"
                          text={activeTypingLabel}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-white/8 px-4 py-4 sm:px-6">
                    <MessageInput
                      value={composerValue}
                      onChange={setComposerValue}
                      onSubmit={handleComposerSubmit}
                      onOpenEmoji={handleEmojiAttempt}
                      onOpenAttachment={
                        handleAttachmentAttempt
                      }
                      disabled={
                        socketStatus !== "connected"
                      }
                      enterToSend={
                        preferences.enterToSend
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-full min-h-0 flex-1 flex-col">
                  <div className="shrink-0 flex items-center justify-between border-b border-white/8 px-4 py-4 sm:px-6">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Workspace
                      </p>
                      <p className="text-xs text-zinc-500">
                        Ready for live conversations
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open conversations"
                        onClick={() =>
                          setIsListDrawerOpen(true)
                        }
                        className="rounded-xl lg:hidden"
                      >
                        <UsersRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setIsSearchOpen(true)
                        }
                        disabled={
                          loadingConversations
                        }
                      >
                        <Search className="h-4 w-4" />
                        <span>Search users</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10">
                    {loadingConversations ? (
                      <div className="w-full max-w-md space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-40 w-full rounded-[1.8rem]" />
                      </div>
                    ) : (
                      <EmptyState
                        icon={MessageSquareMore}
                        title="Choose someone to start chatting"
                        description="Search users"
                        actionLabel="Search users"
                        onAction={() =>
                          setIsSearchOpen(true)
                        }
                        secondaryLabel="Create group"
                        onSecondaryAction={() =>
                          setGroupModalState({
                            open: true,
                            mode: "create",
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <AnimatePresence>
          {isListDrawerOpen ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                onClick={() =>
                  setIsListDrawerOpen(false)
                }
                aria-label="Close conversations drawer overlay"
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              />

              <motion.div
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={transition}
                className="fixed inset-y-4 left-4 z-40 w-[min(90vw,340px)] lg:hidden"
              >
                <ChatList
                  chats={chatCards}
                  activeChatId={
                    activeConversationId
                  }
                  filterValue={chatFilter}
                  onFilterChange={setChatFilter}
                  onSelectChat={handleSelectChat}
                  onOpenSearch={() =>
                    setIsSearchOpen(true)
                  }
                  onOpenGroups={() =>
                    setGroupModalState({
                      open: true,
                      mode: "create",
                    })
                  }
                  compact={preferences.compactList}
                  showEmailPreview={
                    preferences.showEmailPreview
                  }
                />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <SearchUsersModal
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          currentUserId={currentUser?.id}
          onSelectUser={handleSelectUser}
        />

        <CreateGroupModal
          key={
            `${groupModalState.mode}-${groupModalState.open}`
          }
          open={groupModalState.open}
          onClose={() =>
            setGroupModalState((current) => ({
              ...current,
              open: false,
            }))
          }
          currentUserId={currentUser?.id}
          mode={groupModalState.mode}
          title={
            groupModalState.mode ===
            "create"
              ? "Create group"
              : "Add members"
          }
          description={
            groupModalState.mode ===
            "create"
              ? "Create a live group conversation and notify selected members instantly."
              : "Invite more people into the active group chat."
          }
          confirmLabel={
            groupModalState.mode ===
            "create"
              ? "Create group"
              : "Add members"
          }
          hideGroupName={
            groupModalState.mode ===
            "addMembers"
          }
          excludedUserIds={
            selectedConversation?.participants?.map(
              (participant) =>
                participant.id
            ) ?? []
          }
          onSubmit={
            groupModalState.mode ===
            "create"
              ? handleCreateGroup
              : handleAddMembers
          }
        />

        <SettingsModal
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={currentUser}
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
          onClearRecentChats={handleClearRecentChats}
        />

        <ProfileDrawer
          open={profileState.open}
          user={profileState.user}
          mode={profileState.mode}
          heading={
            profileState.mode === "account"
              ? "Your profile"
              : "Contact details"
          }
          subheading={
            profileState.mode === "account"
              ? "Manage session and preferences"
              : "Presence and chat details for this contact."
          }
          presenceLabel={
            profileState.mode === "account"
              ? "Authenticated now"
              : selectedConversation?.online
              ? "Online now"
              : formatLastSeen(
                  selectedConversation?.lastSeen
                )
          }
          messageSummary={
            selectedConversation?.lastMessage
              ?.content
              ? `Latest message: ${selectedConversation.lastMessage.content}`
              : "No messages exchanged yet."
          }
          badgeLabel={
            profileState.mode === "account"
              ? "Authenticated"
              : "Direct chat"
          }
          onClose={() =>
            setProfileState((current) => ({
              ...current,
              open: false,
            }))
          }
          onCopyEmail={handleCopyEmail}
          onOpenSettings={() => {
            setProfileState((current) => ({
              ...current,
              open: false,
            }));
            setIsSettingsOpen(true);
          }}
          onLogout={handleLogout}
        />

        <GroupInfoDrawer
          key={`${selectedConversation?.id ?? "no-group"}-${selectedConversation?.groupName ?? ""}-${isGroupDrawerOpen}`}
          open={isGroupDrawerOpen}
          conversation={selectedConversation}
          currentUserId={currentUser?.id}
          onClose={() =>
            setIsGroupDrawerOpen(false)
          }
          onRenameGroup={handleRenameGroup}
          onOpenAddMembers={() =>
            setGroupModalState({
              open: true,
              mode: "addMembers",
            })
          }
          onRemoveMember={handleRemoveMember}
          onLeaveGroup={handleLeaveGroup}
        />
      </div>
    </motion.main>
  );
};

export default Home;
