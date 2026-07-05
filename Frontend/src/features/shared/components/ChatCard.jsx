import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import { cn } from "../lib/cn";

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const ChatCard = ({
  chat,
  active,
  compact = false,
  showEmailPreview = true,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(chat)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-[1.6rem] border px-3.5 py-3.5 text-left transition duration-200",
        active
          ? "border-emerald-400/24 bg-emerald-500/10 shadow-[0_16px_30px_rgba(16,185,129,0.1)]"
          : "border-white/6 bg-transparent hover:border-white/12 hover:bg-white/6",
        compact && "py-3"
      )}
    >
      <Avatar name={chat.username} showStatus statusTone="neutral" />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {chat.username}
            </p>
            {showEmailPreview ? (
              <p className="truncate text-xs text-zinc-500">
                {chat.email}
              </p>
            ) : null}
          </div>

          <span className="shrink-0 text-[11px] text-zinc-500">
            {formatTime(chat.lastOpenedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs text-zinc-400">
            {chat.preview || "No messages synced yet"}
          </p>

          {chat.badge ? (
            <Badge tone="success" className="px-2 py-0.5 text-[10px]">
              {chat.badge}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export default ChatCard;
