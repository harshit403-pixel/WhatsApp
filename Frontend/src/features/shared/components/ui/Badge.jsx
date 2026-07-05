import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
  {
    variants: {
      tone: {
        neutral: "border-white/10 bg-white/6 text-zinc-300",
        success:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
        warning:
          "border-amber-400/20 bg-amber-500/10 text-amber-200",
        danger: "border-red-400/20 bg-red-500/10 text-red-200",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

const Badge = ({ className, tone, children }) => {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {children}
    </span>
  );
};

export default Badge;
