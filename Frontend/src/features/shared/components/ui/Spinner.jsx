import { LoaderCircle } from "lucide-react";

import { cn } from "../../lib/cn";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

const Spinner = ({ size = "md", className }) => {
  return (
    <LoaderCircle
      className={cn(
        "animate-spin text-[var(--accent)]",
        sizeClasses[size] ?? sizeClasses.md,
        className
      )}
      aria-hidden="true"
    />
  );
};

export default Spinner;
