import { forwardRef } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "border-emerald-400/25 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] text-black shadow-[0_18px_36px_rgba(16,185,129,0.24)] hover:brightness-110",
        secondary:
          "border-white/10 bg-white/6 text-white hover:border-white/16 hover:bg-white/10",
        ghost:
          "border-transparent bg-transparent text-zinc-300 hover:bg-white/8 hover:text-white",
        danger:
          "border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/16 hover:text-white",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-4.5",
        lg: "h-12 px-5",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
