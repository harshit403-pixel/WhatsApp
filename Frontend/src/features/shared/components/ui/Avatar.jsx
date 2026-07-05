import { UserRound } from "lucide-react";

import { cn } from "../../lib/cn";

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const Avatar = ({
  name,
  size = "md",
  className,
  showStatus = false,
  statusTone = "neutral",
}) => {
  const statusClasses = {
    active: "bg-emerald-400 shadow-[0_0_0_4px_rgba(9,9,11,1)]",
    muted: "bg-zinc-500 shadow-[0_0_0_4px_rgba(9,9,11,1)]",
    neutral: "bg-white/25 shadow-[0_0_0_4px_rgba(9,9,11,1)]",
  };

  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 font-semibold text-white",
          sizeClasses[size] ?? sizeClasses.md,
          className
        )}
        aria-hidden="true"
      >
        {name ? (
          getInitials(name)
        ) : (
          <UserRound className="h-5 w-5 text-zinc-400" />
        )}
      </span>

      {showStatus ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border border-[var(--background-900)]",
            statusClasses[statusTone] ?? statusClasses.neutral
          )}
        />
      ) : null}
    </span>
  );
};

export default Avatar;
