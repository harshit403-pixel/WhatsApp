import { useEffect, useRef } from "react";
import { Paperclip, SendHorizonal, Smile } from "lucide-react";

import { Button } from "./ui/Button";

const MessageInput = ({
  value,
  onChange,
  onSubmit,
  onOpenEmoji,
  onOpenAttachment,
  disabled = false,
  enterToSend = true,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      120
    )}px`;
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) {
      return;
    }

    onSubmit?.(value);
  };

  return (
    <div className="glass-panel flex items-end gap-2 rounded-[1.7rem] p-3">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open emoji picker"
        disabled={disabled}
        onClick={onOpenEmoji}
        className="rounded-[1.1rem]"
      >
        <Smile className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Attach a file"
        disabled={disabled}
        onClick={onOpenAttachment}
        className="rounded-[1.1rem]"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="message-draft">
          Type a message
        </label>
        <textarea
          id="message-draft"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              enterToSend &&
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Type your message"
          className="max-h-[120px] min-h-[44px] w-full resize-none border-0 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:text-zinc-500"
        />
      </div>

      <Button
        size="icon"
        aria-label="Send message"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="rounded-[1.1rem]"
      >
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
