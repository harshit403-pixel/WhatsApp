import { AnimatePresence, motion } from "framer-motion";
import { Mail, LogOut, Settings2, ShieldCheck, X } from "lucide-react";

import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import { Button } from "./ui/Button";

const DetailCard = ({ title, value }) => {
  return (
    <div className="rounded-[1.45rem] border border-white/8 bg-white/4 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-sm text-zinc-200">
        {value}
      </p>
    </div>
  );
};

const ProfileDrawer = ({
  open,
  user,
  mode = "account",
  onClose,
  onCopyEmail,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close profile drawer overlay"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24 }}
            className="glass-panel-strong fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-white">
                  {mode === "account"
                    ? "Your profile"
                    : "Contact details"}
                </p>
                <p className="text-xs text-zinc-500">
                  {mode === "account"
                    ? "Manage session and preferences"
                    : "Quick reference for the selected chat"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Close profile drawer"
                onClick={onClose}
                className="rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="app-scrollbar flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="flex flex-col items-start gap-5 rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
                  <Avatar name={user?.username} size="xl" />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold text-white">
                        {user?.username || "Unknown user"}
                      </h2>
                      <Badge tone="neutral">
                        {mode === "account"
                          ? "Authenticated"
                          : "Directory contact"}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={onCopyEmail}
                      className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-zinc-500" />
                      <span>{user?.email || "No email available"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    title="Presence"
                    value={
                      mode === "account"
                        ? "Authenticated now"
                        : "Live presence unavailable in current frontend contract"
                    }
                  />
                  <DetailCard
                    title="Messages"
                    value="Conversation UI is ready for live transport integration"
                  />
                </div>

                <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Production-safe frontend changes
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Existing authentication and backend contracts remain
                        untouched. This drawer only reflects the available
                        frontend state.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {mode === "account" ? (
              <div className="flex items-center gap-3 border-t border-white/8 px-6 py-5">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onOpenSettings}
                >
                  <Settings2 className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default ProfileDrawer;
