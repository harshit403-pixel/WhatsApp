import { useDeferredValue, useEffect, useState } from "react";
import { Search, UsersRound, X } from "lucide-react";

import { searchUsers } from "../../chats/services/users.api";
import { appToast } from "../lib/toast";
import Avatar from "./ui/Avatar";
import { Button } from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import SearchInput from "./ui/SearchInput";
import Skeleton from "./ui/Skeleton";

const resolveUserId = (entry) =>
  entry?.id ?? entry?._id ?? entry?.userId ?? "";

const CreateGroupModal = ({
  open,
  onClose,
  currentUserId,
  onSubmit,
}) => {
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const trimmedQuery = deferredQuery.trim();

    if (trimmedQuery.length < 2) {
      const frame = window.requestAnimationFrame(() => {
        setResults([]);
        setLoading(false);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const controller = new AbortController();
    let isActive = true;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const users = await searchUsers(
          trimmedQuery,
          controller.signal
        );

        setResults(
          users.filter(
            (entry) =>
              resolveUserId(entry) !== currentUserId
          )
        );
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.code !== "ERR_CANCELED"
        ) {
          appToast.error(
            "Unable to search users",
            "Try your group member search again."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      isActive = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [currentUserId, deferredQuery, open]);

  const toggleUser = (entry) => {
    const id = resolveUserId(entry);

    setSelectedUsers((current) => {
      const exists = current.some(
        (user) => resolveUserId(user) === id
      );

      if (exists) {
        return current.filter(
          (user) => resolveUserId(user) !== id
        );
      }

      return [...current, entry];
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create group"
      description="Build the frontend member-selection flow now. A real create-group API can plug into this modal later without reworking the UI."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit?.({
                name: groupName.trim(),
                members: selectedUsers,
              })
            }
            disabled={!groupName.trim() || !selectedUsers.length}
          >
            Continue
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Group name"
          value={groupName}
          onChange={(event) =>
            setGroupName(event.target.value)
          }
          placeholder="Design squad"
        />

        <SearchInput
          label="Members"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search users to add"
        />

        {selectedUsers.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((entry) => (
              <span
                key={resolveUserId(entry)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm text-zinc-200"
              >
                <Avatar name={entry.username} size="sm" />
                <span>{entry.username}</span>
                <button
                  type="button"
                  aria-label={`Remove ${entry.username}`}
                  onClick={() => toggleUser(entry)}
                  className="text-zinc-500 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4"
              >
                <Skeleton className="h-11 w-11 rounded-[1.1rem]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length ? (
          <div className="grid gap-3">
            {results.map((entry) => {
              const id = resolveUserId(entry);
              const selected = selectedUsers.some(
                (user) => resolveUserId(user) === id
              );

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleUser(entry)}
                  className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4 text-left transition hover:border-emerald-400/18 hover:bg-emerald-500/8"
                >
                  <Avatar name={entry.username} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {entry.username}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {entry.email}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-300">
                    {selected ? "Added" : "Add"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center">
            <EmptyState
              icon={query.trim().length >= 2 ? Search : UsersRound}
              title={
                query.trim().length >= 2
                  ? "No users matched that search"
                  : "Search users to build your group"
              }
              description={
                query.trim().length >= 2
                  ? "Try another username to keep adding members."
                  : "This modal is wired to the live user search endpoint so the member picker stays aligned with backend data."
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
