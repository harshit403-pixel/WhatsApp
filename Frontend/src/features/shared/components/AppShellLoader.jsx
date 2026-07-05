import { motion } from "framer-motion";
import { MessageSquareMore } from "lucide-react";

import Spinner from "./ui/Spinner";

/**
 * Full-screen loader shown while the app restores
 * authentication and initial application data.
 */
const AppShellLoader = ({
  title = "Loading your chats",
  description = "Please wait while we restore your session.",
}) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_26%)]" />

      {/* Loader card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="glass-panel-strong relative z-10 flex w-full max-w-lg flex-col items-center gap-5 rounded-[2rem] px-8 py-10 text-center"
      >
        <span className="inline-flex h-18 w-18 items-center justify-center rounded-[1.6rem] border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
          <MessageSquareMore className="h-8 w-8" />
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            {title}
          </h1>

          <p className="text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </div>

        {/* Authentication/session restore indicator */}
        <div className="flex items-center gap-3 rounded-full border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-zinc-300">
          <Spinner size="sm" />
          <span>Restoring session...</span>
        </div>
      </motion.div>
    </main>
  );
};

export default AppShellLoader;