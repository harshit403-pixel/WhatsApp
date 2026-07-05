import {
  LogOut,
  MessageSquarePlus,
  Search,
  Settings2,
} from "lucide-react";

import Avatar from "./ui/Avatar";
import { Button } from "./ui/Button";
import Tooltip from "./ui/Tooltip";

const Sidebar = ({
  user,
  onOpenSearch,
  onOpenProfile,
  onOpenGroups,
  onOpenSettings,
  onLogout,
}) => {
  const actions = [
    {
      key: "search",
      label: "Search users",
      icon: Search,
      onClick: onOpenSearch,
    },
    {
      key: "group",
      label: "Create group",
      icon: MessageSquarePlus,
      onClick: onOpenGroups,
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings2,
      onClick: onOpenSettings,
    },
  ];

  return (
    <aside className="hidden w-20 shrink-0 flex-col items-center justify-between border-r border-white/8 bg-[rgba(9,9,11,0.68)] px-3 py-6 backdrop-blur-xl md:flex">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.65rem] border border-emerald-400/20 bg-emerald-500/10 text-lg font-semibold text-emerald-300 shadow-[0_18px_36px_rgba(16,185,129,0.15)]">
          W
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-600">
          Chat
        </span>
      </div>

      <div className="flex flex-col items-center gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Tooltip key={action.key} content={action.label}>
              <Button
                size="icon"
                variant="ghost"
                aria-label={action.label}
                onClick={action.onClick}
                className="rounded-[1.35rem] border border-white/6 bg-white/4 text-zinc-300 hover:border-white/12 hover:bg-white/8 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </Button>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Tooltip content="Profile">
          <button
            type="button"
            aria-label="Open profile"
            onClick={onOpenProfile}
            className="rounded-[1.35rem] p-0.5 transition hover:scale-[1.02]"
          >
            <Avatar
              name={user?.username}
              size="lg"
              showStatus
              statusTone="active"
            />
          </button>
        </Tooltip>

        <Tooltip content="Log out">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Log out"
            onClick={onLogout}
            className="rounded-[1.35rem] border border-white/6 bg-white/4 text-zinc-300 hover:border-red-400/16 hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
};

export default Sidebar;
