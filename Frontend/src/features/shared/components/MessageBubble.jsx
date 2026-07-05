import {
  Check,
  CheckCheck,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { cn } from "../lib/cn";

const deliveryIcons = {
  sending: LoaderCircle,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
};

const MessageBubble = ({
  text,
  timestamp,
  variant = "incoming",
  deliveryState,
  senderName,
  clientState,
}) => {
  const DeliveryIcon = deliveryIcons[deliveryState];

  return (
    <div
      className={cn(
        "flex w-full",
        variant === "outgoing"
          ? "justify-end"
          : variant === "system"
          ? "justify-center"
          : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-xl rounded-[1.65rem] px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.18)]",
          variant === "incoming" &&
            "border border-white/8 bg-white/6 text-zinc-100",
          variant === "outgoing" &&
            "border border-emerald-400/18 bg-emerald-500/12 text-white",
          variant === "system" &&
            "flex items-start gap-3 border border-white/8 bg-white/4 text-zinc-300"
        )}
      >
        {variant === "system" ? (
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
        ) : null}

        <div className="space-y-2">
          {senderName ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
              {senderName}
            </p>
          ) : null}
          <p className="text-sm leading-6">{text}</p>
          {timestamp ? (
            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
              <span>{timestamp}</span>
              {clientState === "failed" ? (
                <span className="text-red-300">
                  Failed
                </span>
              ) : null}
              {DeliveryIcon ? (
                <DeliveryIcon
                  className={cn(
                    "h-3.5 w-3.5",
                    deliveryState === "sending" &&
                      "animate-spin",
                    deliveryState === "read"
                      ? "text-emerald-300"
                      : "text-zinc-500"
                  )}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
