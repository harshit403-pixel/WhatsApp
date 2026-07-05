import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";

import Badge from "../../shared/components/ui/Badge";

const AuthShell = ({
  eyebrow,
  title,
  description,
  footerPrompt,
  footerLabel,
  footerHref,
  children,
}) => {
  return (
    <main className="relative flex min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,197,94,0.22),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(16,185,129,0.16),transparent_20%),radial-gradient(circle_at_50%_95%,rgba(255,255,255,0.05),transparent_24%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/8 bg-[rgba(9,9,11,0.72)] shadow-[0_36px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28 }}
          className="flex min-h-[calc(100vh-4rem)] flex-col justify-between px-6 py-8 sm:px-8 lg:min-h-0 lg:px-12 lg:py-10"
        >
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/18 bg-emerald-500/10 text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </span>

              <div>
                <p className="text-sm font-semibold text-white">
                  WhatsApp Desktop
                </p>
                <p className="text-xs text-zinc-500">
                  Secure real-time workspace
                </p>
              </div>
            </div>

            <div className="max-w-lg space-y-4">
              <Badge tone="success" className="w-fit">
                {eyebrow}
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
                {description}
              </p>
            </div>

            {children}
          </div>

          <p className="pt-8 text-sm text-zinc-500">
            {footerPrompt}{" "}
            <Link
              to={footerHref}
              className="font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              {footerLabel}
            </Link>
          </p>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative hidden overflow-hidden border-l border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_100%)] p-10 lg:flex lg:flex-col"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="space-y-6">
              <Badge className="w-fit">Dark Mode Only</Badge>

              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-white">
                  Premium messaging, rebuilt for focus.
                </h2>
                <p className="text-sm leading-7 text-zinc-400">
                  Minimal surfaces, soft depth, and a layout that keeps your
                  conversations centered without fighting for attention.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  "Secure sessions handled with existing backend auth.",
                  "Fast search and contact discovery wired to live APIs.",
                  "Desktop-first shell with polished mobile transitions.",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="glass-panel flex items-start gap-3 rounded-2xl p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <p className="text-sm leading-6 text-zinc-300">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-zinc-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Production-safe UI layer
                  </p>
                  <p className="text-xs text-zinc-500">
                    Preserves existing routes, hooks, and auth contracts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
};

export default AuthShell;
