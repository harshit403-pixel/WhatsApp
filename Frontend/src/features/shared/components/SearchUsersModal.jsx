import { useDeferredValue, useEffect, useState } from "react";
import { Search, UserRoundPlus } from "lucide-react";

import { searchUsers } from "../../chats/services/users.api";
import { appToast } from "../lib/toast";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Modal from "./ui/Modal";
import SearchInput from "./ui/SearchInput";
import Skeleton from "./ui/Skeleton";

/**
 * Normalizes different user shapes returned by APIs.
 * Some endpoints may return id, _id, or userId.
 */
const resolveUserId = (entry) =>
  entry?.id ?? entry?._id ?? entry?.userId ?? "";

const SearchUsersModal = ({
  open,
  onClose,
  currentUserId,
  onSelectUser,
}) => {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't run searches while the modal is closed.
    if (!open) {
      return undefined;
    }

    const trimmedQuery = deferredQuery.trim();

    // Require at least two characters before hitting the API.
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

    // Small debounce to avoid making a request on every keystroke.
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const users = await searchUsers(
          trimmedQuery,
          controller.signal
        );

        // Hide the current user from the search results.
        setResults(
          users.filter(
            (entry) =>
              resolveUserId(entry) !== currentUserId
          )
        );
      } catch (error) {
        // Ignore aborted requests when the user types quickly.
        if (
          error.name !== "CanceledError" &&
          error.code !== "ERR_CANCELED"
        ) {
          appToast.error(
            "Unable to search users",
            "Please try again."
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search users"
      description="Find users and start a conversation."
      size="lg"
    >
      <div className="space-y-5">
        <SearchInput
          aria-label="Search users by username"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search by username"
        />

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-4"
              >
                <Skeleton className="h-11 w-11 rounded-[1.1rem]" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length ? (
          <div className="grid gap-3">
            {results.map((entry) => (
              <button
                key={resolveUserId(entry)}
                type="button"
                onClick={() => onSelectUser?.(entry)}
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
                  Open
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center">
            {query.trim().length >= 2 ? (
              <EmptyState
                icon={Search}
                title="No users found"
                description="Try a different username."
              />
            ) : (
              <EmptyState
                icon={UserRoundPlus}
                title="Find people"
                description="Type at least 2 characters to search."
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchUsersModal;