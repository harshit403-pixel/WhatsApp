import { MessageCircleDashed, UsersRound } from "lucide-react";

import ChatCard from "./ChatCard";
import { Button } from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import SearchInput from "./ui/SearchInput";

const ChatList = ({
  chats,
  activeChatId,
  filterValue,
  onFilterChange,
  onSelectChat,
  onOpenSearch,
  onOpenGroups,
  compact = false,
  showEmailPreview = true,
}) => {
  return (
    <aside className="glass-panel flex h-full min-h-0 w-full flex-col rounded-[2rem]">
      <div className="space-y-5 border-b border-white/8 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Conversations
            </h2>
            <p className="text-sm text-zinc-500">
              Recent contacts from your live user search flow.
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            {chats.length}
          </span>
        </div>

        <SearchInput
          aria-label="Filter recent chats"
          value={filterValue}
          onChange={(event) =>
            onFilterChange?.(event.target.value)
          }
          placeholder="Filter recent chats"
        />

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onOpenSearch}>
            <UsersRound className="h-4 w-4" />
            <span>New chat</span>
          </Button>
          <Button variant="secondary" onClick={onOpenGroups}>
            <MessageCircleDashed className="h-4 w-4" />
            <span>New group</span>
          </Button>
        </div>
      </div>

      <div className="app-scrollbar flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {chats.length ? (
          chats.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              active={chat.id === activeChatId}
              compact={compact}
              showEmailPreview={showEmailPreview}
              onSelect={onSelectChat}
            />
          ))
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center px-4">
            <EmptyState
              icon={UsersRound}
              title="No recent chats yet"
              description="Use live user search to open a conversation and it will appear here for quick access."
              actionLabel="Search users"
              onAction={onOpenSearch}
              secondaryLabel="Create group"
              onSecondaryAction={onOpenGroups}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatList;
