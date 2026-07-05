import { toast } from "sonner";

import { cn } from "./cn";

const baseOptions = {
  duration: 3200,
};

const buildClasses = (toneClasses) => ({
  toast: cn(
    "rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
    "bg-[rgba(9,9,11,0.94)] text-white",
    toneClasses
  ),
  title: "text-sm font-semibold",
  description: "text-xs text-zinc-400",
  closeButton:
    "border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white",
});

export const appToast = {
  success: (title, description) =>
    toast.success(title, {
      ...baseOptions,
      description,
      classNames: buildClasses("border-emerald-400/25"),
    }),
  error: (title, description) =>
    toast.error(title, {
      ...baseOptions,
      description,
      classNames: buildClasses("border-red-400/25"),
    }),
  warning: (title, description) =>
    toast.warning(title, {
      ...baseOptions,
      description,
      classNames: buildClasses("border-amber-400/25"),
    }),
  info: (title, description) =>
    toast(title, {
      ...baseOptions,
      description,
      classNames: buildClasses("border-white/12"),
    }),
};
