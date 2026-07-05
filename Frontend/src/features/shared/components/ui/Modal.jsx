import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "./Button";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close modal overlay"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "glass-panel-strong relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[2rem]",
              sizeClasses[size] ?? sizeClasses.md
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>
                {description ? (
                  <p className="text-sm text-zinc-400">
                    {description}
                  </p>
                ) : null}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl"
                aria-label="Close modal"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="app-scrollbar flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {footer ? (
              <div className="flex items-center justify-end gap-3 border-t border-white/8 px-6 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
