import { forwardRef } from "react";

import { cn } from "../../lib/cn";

const Input = forwardRef(
  (
    {
      className,
      inputClassName,
      label,
      error,
      hint,
      icon,
      rightSlot,
      ...props
    },
    ref
  ) => {
    return (
      <label className="flex w-full flex-col gap-2 text-sm text-zinc-300">
        {label ? (
          <span className="font-medium text-zinc-200">
            {label}
          </span>
        ) : null}

        <span
          className={cn(
            "group flex h-12 items-center gap-3 rounded-2xl border px-4 transition duration-200",
            "bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
            error
              ? "border-red-400/35"
              : "border-white/10 hover:border-white/16 focus-within:border-emerald-400/35",
            className
          )}
        >
          {icon ? (
            <span className="text-zinc-500 group-focus-within:text-emerald-300">
              {icon}
            </span>
          ) : null}

          <input
            ref={ref}
            className={cn(
              "w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500",
              inputClassName
            )}
            {...props}
          />

          {rightSlot}
        </span>

        {error ? (
          <span className="text-xs text-red-300">
            {error}
          </span>
        ) : hint ? (
          <span className="text-xs text-zinc-500">
            {hint}
          </span>
        ) : null}
      </label>
    );
  }
);

Input.displayName = "Input";

export default Input;
