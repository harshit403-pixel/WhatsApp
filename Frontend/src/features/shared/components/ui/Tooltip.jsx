import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Tooltip = ({ content, children }) => {
  const [open, setOpen] = useState(false);

  if (!content) {
    return children;
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}

      <AnimatePresence>
        {open ? (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[rgba(17,17,17,0.96)] px-2.5 py-1.5 text-xs font-medium text-zinc-200 shadow-xl backdrop-blur-xl"
          >
            {content}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
