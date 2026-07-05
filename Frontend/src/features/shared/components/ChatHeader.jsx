import {
  ChevronLeft,
  MoreVertical,
  PhoneCall,
  PanelLeftOpen,
  UsersRound,
  UserRound,
} from "lucide-react";

import Avatar from "./ui/Avatar";
import { Button } from "./ui/Button";
import Dropdown from "./ui/Dropdown";
import Tooltip from "./ui/Tooltip";

/**
 * Header shown above the active conversation.
 *
 * Supports:
 * - Opening the chat list on smaller screens
 * - Opening contact/group information
 * - Starting a call
 * - Additional conversation actions
 */
const ChatHeader = ({
  chat,
  onOpenList,
  onOpenProfile,
  onStartCall,
  menuItems,
  showCallAction = true,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/8 px-4 py-4 sm:px-6">
      {/* Left side: avatar and conversation details */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile button to reopen the conversation list */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open conversations"
          onClick={onOpenList}
          className="rounded-xl border border-white/8 bg-white/4 lg:hidden"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>

        <Avatar
          name={chat.username}
          size="lg"
          showStatus={!chat.isGroup}
          statusTone={chat.online ? "active" : "muted"}
        />

        <div className="min-w-0">
          {/* Clicking the name opens the profile or group information */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 rounded-xl text-left transition hover:text-emerald-200"
          >
            <span className="truncate text-sm font-semibold text-white sm:text-base">
              {chat.username}
            </span>

            {chat.isGroup ? (
              <UsersRound className="h-3.5 w-3.5 text-zinc-500" />
            ) : (
              <UserRound className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </button>

          <p className="truncate text-xs text-zinc-500 sm:text-sm">
            {chat.email}
          </p>
        </div>
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-2">
        {/* Back button shown only on mobile */}
        <Tooltip content="Back to conversations">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to conversation list"
            onClick={onOpenList}
            className="rounded-xl border border-white/8 bg-white/4 md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Tooltip>

        {/* Direct and group call action */}
        {showCallAction ? (
          <Tooltip content="Start call">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Start call"
              onClick={onStartCall}
              className="rounded-xl border border-white/8 bg-white/4"
            >
              <PhoneCall className="h-4 w-4" />
            </Button>
          </Tooltip>
        ) : null}

        {/* Extra conversation actions */}
        <Dropdown
          triggerLabel="Conversation actions"
          trigger={
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-zinc-300 transition hover:bg-white/8 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </span>
          }
          items={menuItems}
        />
      </div>
    </header>
  );
};

export default ChatHeader;