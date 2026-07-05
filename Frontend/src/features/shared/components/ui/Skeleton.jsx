import { cn } from "../../lib/cn";

const Skeleton = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5",
        className
      )}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
