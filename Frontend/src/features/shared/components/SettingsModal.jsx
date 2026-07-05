import { BellRing, BrushCleaning, Keyboard, MoonStar } from "lucide-react";

import { Button } from "./ui/Button";
import Modal from "./ui/Modal";

const ToggleRow = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.55rem] border border-white/8 bg-white/4 px-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-zinc-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {title}
          </p>
          <p className="text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-400/90" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

const SettingsModal = ({
  open,
  onClose,
  user,
  preferences,
  onPreferenceChange,
  onClearRecentChats,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      description="Dark mode stays locked in. These preferences only tune the frontend experience."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={onClearRecentChats}>
            Clear recent chats
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-[1.7rem] border border-white/8 bg-white/4 p-5">
          <p className="text-sm font-semibold text-white">
            Signed in as {user?.username}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {user?.email}
          </p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            icon={Keyboard}
            title="Press Enter to send"
            description="Use Enter to submit the composer and Shift + Enter for a new line."
            checked={preferences.enterToSend}
            onChange={(checked) =>
              onPreferenceChange?.(
                "enterToSend",
                checked
              )
            }
          />
          <ToggleRow
            icon={BrushCleaning}
            title="Compact chat list"
            description="Reduce the vertical space used by recent contact cards."
            checked={preferences.compactList}
            onChange={(checked) =>
              onPreferenceChange?.(
                "compactList",
                checked
              )
            }
          />
          <ToggleRow
            icon={BellRing}
            title="Show email previews"
            description="Keep directory email previews visible in the conversation list."
            checked={preferences.showEmailPreview}
            onChange={(checked) =>
              onPreferenceChange?.(
                "showEmailPreview",
                checked
              )
            }
          />
          <ToggleRow
            icon={MoonStar}
            title="Reduce motion"
            description="Dial down the page and drawer animations for a calmer experience."
            checked={preferences.reducedMotion}
            onChange={(checked) =>
              onPreferenceChange?.(
                "reducedMotion",
                checked
              )
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
