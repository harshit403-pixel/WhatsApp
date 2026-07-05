import { motion } from "framer-motion";

import { Button } from "./Button";

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}) => {
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 text-center"
    >
      <span className="glass-panel inline-flex h-16 w-16 items-center justify-center rounded-[1.75rem] text-emerald-300">
        {Icon ? <Icon className="h-7 w-7" /> : null}
      </span>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
        <p className="text-sm leading-6 text-zinc-400">
          {description}
        </p>
      </div>

      {actionLabel ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
          {secondaryLabel ? (
            <Button
              variant="secondary"
              onClick={onSecondaryAction}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
};

export default EmptyState;
