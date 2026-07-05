import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PencilLine,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";

import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import { Button } from "./ui/Button";
import Input from "./ui/Input";

/**
 * Drawer used to manage group information.
 *
 * Features:
 * - Rename group
 * - View members
 * - Add members
 * - Remove members
 * - Leave group
 */
const GroupInfoDrawer = ({
  open,
  conversation,
  currentUserId,
  onClose,
  onRenameGroup,
  onOpenAddMembers,
  onRemoveMember,
  onLeaveGroup,
}) => {
  const [draftName, setDraftName] =
    useState(
      conversation?.groupName ??
        conversation?.name ??
        ""
    );

  const isAdmin =
    conversation?.admins?.includes(
      currentUserId
    ) ?? false;

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
            aria-label="Close group drawer overlay"
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
                  Group info
                </p>
                <p className="text-xs text-zinc-500">
                  Manage group settings and members.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Close group drawer"
                onClick={onClose}
                className="rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="app-scrollbar flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={
                        conversation?.groupName ??
                        conversation?.name
                      }
                      size="xl"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-2xl font-semibold text-white">
                          {conversation?.groupName ??
                            conversation?.name}
                        </h2>
                        <Badge tone="neutral">
                          {conversation?.participants
                            ?.length ?? 0}{" "}
                          members
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        {isAdmin
                          ? "You can manage this group."
                          : "Only admins can make changes."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Group name"
                    value={draftName}
                    onChange={(event) =>
                      setDraftName(
                        event.target.value
                      )
                    }
                    placeholder="Product team"
                    rightSlot={
                      <PencilLine className="h-4 w-4 text-zinc-500" />
                    }
                  />

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      onRenameGroup?.(draftName)
                    }
                    disabled={
                      !isAdmin ||
                      !draftName.trim() ||
                      draftName.trim() ===
                        (conversation?.groupName ??
                          conversation?.name)
                    }
                  >
                    Save group name
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Members
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Manage group members.
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={onOpenAddMembers}
                      disabled={!isAdmin}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {conversation?.participants?.map(
                      (participant) => {
                        const participantIsAdmin =
                          conversation.admins?.includes(
                            participant.id
                          );
                        const isCurrentUser =
                          participant.id ===
                          currentUserId;

                        return (
                          <div
                            key={participant.id}
                            className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-white/4 px-4 py-3"
                          >
                            <Avatar
                              name={
                                participant.username
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">
                                {
                                  participant.username
                                }
                              </p>
                              <p className="truncate text-xs text-zinc-500">
                                {participant.email}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {participantIsAdmin ? (
                                <Badge tone="success">
                                  Admin
                                </Badge>
                              ) : null}
                              {isCurrentUser ? (
                                <Badge>
                                  You
                                </Badge>
                              ) : null}
                              {isAdmin &&
                              !isCurrentUser ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-200"
                                  aria-label={`Remove ${participant.username}`}
                                  onClick={() =>
                                    onRemoveMember?.(
                                      participant.id
                                    )
                                  }
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

               
              </div>
            </div>

            <div className="border-t border-white/8 px-6 py-5">
              <Button
                variant="danger"
                className="w-full"
                onClick={onLeaveGroup}
              >
                Leave group
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default GroupInfoDrawer;
