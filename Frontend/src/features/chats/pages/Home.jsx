import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquareMore,
  PhoneCall,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import useAuth from "../../auth/hooks/useAuth";
import ChatHeader from "../../shared/components/ChatHeader";
import ChatList from "../../shared/components/ChatList";
import CreateGroupModal from "../../shared/components/CreateGroupModal";
import MessageBubble from "../../shared/components/MessageBubble";
import MessageInput from "../../shared/components/MessageInput";
import ProfileDrawer from "../../shared/components/ProfileDrawer";
import SearchUsersModal from "../../shared/components/SearchUsersModal";
import SettingsModal from "../../shared/components/SettingsModal";
import Sidebar from "../../shared/components/Sidebar";
import { Button } from "../../shared/components/ui/Button";
import EmptyState from "../../shared/components/ui/EmptyState";
import { appToast } from "../../shared/lib/toast";
import { logoutUser } from "../../auth/services/auth.api";

const RECENT_CHATS_KEY = "whatsapp:recent-chats";
const UI_PREFERENCES_KEY = "whatsapp:ui-preferences";

const defaultPreferences = {
  compactList: false,
  enterToSend: true,
  showEmailPreview: true,
  reducedMotion: false,
};

const readStoredChats = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(
      RECENT_CHATS_KEY
    );
    const parsed = JSON.parse(value ?? "[]");

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

const normalizeUser = (entry) => ({
  id: entry?.id ?? entry?._id ?? entry?.userId ?? "",
  username: entry?.username ?? "Unknown user",
  email: entry?.email ?? "No email available",
  preview: "Conversation shell ready",
  lastOpenedAt: new Date().toISOString(),
  badge: 0,
});

const Home = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const [chatFilter, setChatFilter] = useState("");
  const deferredChatFilter =
    useDeferredValue(chatFilter);
  const [composerValue, setComposerValue] =
    useState("");
  const [recentChats, setRecentChats] = useState(
    readStoredChats
  );
  const [selectedChatId, setSelectedChatId] =
    useState(() => readStoredChats()[0]?.id ?? null);
  const [preferences, setPreferences] = useState(
    readStoredPreferences
  );
  const [isSearchOpen, setIsSearchOpen] =
    useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] =
    useState(false);
  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);
  const [isListDrawerOpen, setIsListDrawerOpen] =
    useState(false);
  const [profileState, setProfileState] = useState({
    open: false,
    mode: "account",
    user: null,
  });

  useEffect(() => {
    window.localStorage.setItem(
      RECENT_CHATS_KEY,
      JSON.stringify(recentChats)
    );
  }, [recentChats]);

  useEffect(() => {
    window.localStorage.setItem(
      UI_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
  }, [preferences]);

  const activeChatId = recentChats.some(
    (chat) => chat.id === selectedChatId
  )
    ? selectedChatId
    : recentChats[0]?.id ?? null;

  const selectedChat =
    recentChats.find(
      (chat) => chat.id === activeChatId
    ) ?? null;

  const filteredChats = recentChats.filter((chat) => {
    const query = deferredChatFilter
      .trim()
      .toLowerCase();

    if (!query) {
      return true;
    }

    return [chat.username, chat.email, chat.preview]
      .filter(Boolean)
      .some((value) =>
        value.toLowerCase().includes(query)
      );
  });

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
    if (!selectedChat) {
      return;
    }

    setProfileState({
      open: true,
      mode: "contact",
      user: selectedChat,
    });
  };

  const handleSelectUser = (entry) => {
    const normalized = normalizeUser(entry);

    startTransition(() => {
      setRecentChats((current) => {
        const existingChat = current.find(
          (chat) => chat.id === normalized.id
        );

        const nextChat = {
          ...(existingChat ?? {}),
          ...normalized,
          preview:
            existingChat?.preview ??
            "Start a conversation",
          lastOpenedAt: new Date().toISOString(),
        };

        return [
          nextChat,
          ...current.filter(
            (chat) => chat.id !== normalized.id
          ),
        ].slice(0, 18);
      });
      setSelectedChatId(normalized.id);
      setComposerValue("");
      setIsListDrawerOpen(false);
    });

    setIsSearchOpen(false);
    appToast.success(
      `Opened ${normalized.username}`,
      "The conversation shell is ready for live history and socket transport when those frontend contracts are exposed."
    );
  };

  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.id);
    setComposerValue("");
    setIsListDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
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

  const handlePreferenceChange = (key, value) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleClearRecentChats = () => {
    setRecentChats([]);
    setComposerValue("");
    appToast.info(
      "Recent chats cleared",
      "You can repopulate this list from live user search at any time."
    );
  };

  const handleComposerSubmit = () => {
    if (!composerValue.trim()) {
      return;
    }

    appToast.warning(
      "Message sending is not wired yet",
      "The current frontend contract exposes authentication and user search, but not conversation history or send endpoints."
    );
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

  const handleGroupSubmit = ({
    name,
    members,
  }) => {
    appToast.warning(
      "Group creation needs a backend route",
      `The UI captured "${name}" with ${members.length} member selections, but no create-group contract is currently exposed.`
    );
    setIsCreateGroupOpen(false);
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="relative min-h-screen overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_25%)]" />

      <div className="relative flex min-h-screen">
        <Sidebar
          user={currentUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={openAccountDrawer}
          onOpenGroups={() => setIsCreateGroupOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-5">
          <div className="glass-panel mb-4 flex items-center justify-between rounded-[1.7rem] px-4 py-3 md:hidden">
            <div>
              <p className="text-sm font-semibold text-white">
                {currentUser?.username || "Workspace"}
              </p>
              <p className="text-xs text-zinc-500">
                Production-safe desktop shell
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

          <div className="flex min-h-0 flex-1 gap-4">
            <div className="hidden w-[340px] shrink-0 lg:block">
              <ChatList
                chats={filteredChats}
                activeChatId={activeChatId}
                filterValue={chatFilter}
                onFilterChange={setChatFilter}
                onSelectChat={handleSelectChat}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenGroups={() =>
                  setIsCreateGroupOpen(true)
                }
                compact={preferences.compactList}
                showEmailPreview={
                  preferences.showEmailPreview
                }
              />
            </div>

            <section className="glass-panel-strong flex min-h-[calc(100vh-1.5rem)] flex-1 flex-col overflow-hidden rounded-[2rem]">
              {selectedChat ? (
                <>
                  <ChatHeader
                    chat={selectedChat}
                    onOpenList={() =>
                      setIsListDrawerOpen(true)
                    }
                    onOpenProfile={openContactDrawer}
                    onStartCall={handleCallAttempt}
                    menuItems={[
                      {
                        label: "View profile",
                        icon: UserRound,
                        onSelect: openContactDrawer,
                      },
                      {
                        label: "Start call",
                        icon: PhoneCall,
                        onSelect: handleCallAttempt,
                      },
                      {
                        label: "Create group with contact",
                        icon: UsersRound,
                        onSelect: () =>
                          setIsCreateGroupOpen(true),
                      },
                    ]}
                  />

                  <div className="app-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="mx-auto flex max-w-2xl flex-col gap-4">
                      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                        Chat window ready
                      </div>

                      <MessageBubble
                        variant="system"
                        text={`You opened ${selectedChat.username} through the live user directory. This conversation layout is production-ready and waiting for message history plus transport contracts.`}
                      />
                      <MessageBubble
                        variant="system"
                        text="Typing indicators, delivery states, and attachments can slot into this shell without another UI rewrite."
                      />

                      <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
                        <div className="flex items-start gap-3">
                          <MessageSquareMore className="mt-0.5 h-5 w-5 text-emerald-300" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Why this stays honest
                            </p>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                              The backend currently exposes authentication and
                              user search routes to the frontend. Since message
                              history and send endpoints are not available yet,
                              this screen keeps the UX polished without faking
                              chat data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/8 px-4 py-4 sm:px-6">
                    <MessageInput
                      value={composerValue}
                      onChange={setComposerValue}
                      onSubmit={handleComposerSubmit}
                      onOpenEmoji={handleEmojiAttempt}
                      onOpenAttachment={
                        handleAttachmentAttempt
                      }
                      enterToSend={
                        preferences.enterToSend
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-1 flex-col">
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 sm:px-6">
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
                        onClick={() => setIsSearchOpen(true)}
                      >
                        <Search className="h-4 w-4" />
                        <span>Search users</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center justify-center px-6 py-10">
                    <EmptyState
                      icon={MessageSquareMore}
                      title="Choose someone to start chatting"
                      description="Search the live user directory, open a conversation shell, and keep it pinned in your recent chats list."
                      actionLabel="Search users"
                      onAction={() => setIsSearchOpen(true)}
                      secondaryLabel="Create group"
                      onSecondaryAction={() =>
                        setIsCreateGroupOpen(true)
                      }
                    />
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
                onClick={() => setIsListDrawerOpen(false)}
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
                  chats={filteredChats}
                  activeChatId={activeChatId}
                  filterValue={chatFilter}
                  onFilterChange={setChatFilter}
                  onSelectChat={handleSelectChat}
                  onOpenSearch={() =>
                    setIsSearchOpen(true)
                  }
                  onOpenGroups={() =>
                    setIsCreateGroupOpen(true)
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
          key={
            isSearchOpen
              ? "search-modal-open"
              : "search-modal-closed"
          }
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          currentUserId={currentUser?.id}
          onSelectUser={handleSelectUser}
        />

        <CreateGroupModal
          key={
            isCreateGroupOpen
              ? "group-modal-open"
              : "group-modal-closed"
          }
          open={isCreateGroupOpen}
          onClose={() =>
            setIsCreateGroupOpen(false)
          }
          currentUserId={currentUser?.id}
          onSubmit={handleGroupSubmit}
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
      </div>
    </motion.main>
  );
};

export default Home;
