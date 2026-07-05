import { getRedisClient } from "../config/cache.js";

const getUserSocketKey = (userId) =>
  `user:${userId}:sockets`;

const getUserOnlineKey = (userId) =>
  `user:${userId}:online`;

const getUserLastSeenKey = (userId) =>
  `user:${userId}:lastSeen`;

const getTypingKey = (
  conversationId,
  userId
) =>
  `conversation:${conversationId}:typing:${userId}`;

/**
 * We store socket ids in a Redis set so multiple tabs/devices can stay online
 * without clobbering each other.
 */
export const markUserOnline = async (
  userId,
  socketId
) => {
  const redis = getRedisClient();

  await redis
    .multi()
    .sadd(getUserSocketKey(userId), socketId)
    .set(getUserOnlineKey(userId), "1")
    .del(getUserLastSeenKey(userId))
    .exec();
};

export const markUserOffline = async (
  userId,
  socketId
) => {
  const redis = getRedisClient();

  await redis.srem(
    getUserSocketKey(userId),
    socketId
  );

  const remainingSockets = await redis.scard(
    getUserSocketKey(userId)
  );

  if (remainingSockets > 0) {
    return false;
  }

  const lastSeen = new Date().toISOString();

  await redis
    .multi()
    .del(getUserSocketKey(userId))
    .set(getUserOnlineKey(userId), "0")
    .set(getUserLastSeenKey(userId), lastSeen)
    .exec();

  return true;
};

export const isUserOnline = async (userId) => {
  const redis = getRedisClient();
  const online = await redis.get(
    getUserOnlineKey(userId)
  );

  return online === "1";
};

export const getOnlineUserIds = async (
  userIds = []
) => {
  const results = await Promise.all(
    userIds.map(async (userId) => ({
      userId: String(userId),
      online: await isUserOnline(userId),
    }))
  );

  return results
    .filter((entry) => entry.online)
    .map((entry) => entry.userId);
};

export const getPresenceMap = async (
  userIds = []
) => {
  const redis = getRedisClient();
  const uniqueUserIds = [
    ...new Set(
      userIds
        .map((userId) => String(userId))
        .filter(Boolean)
    ),
  ];

  const entries = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const [online, lastSeen] =
        await redis.mget(
          getUserOnlineKey(userId),
          getUserLastSeenKey(userId)
        );

      return [
        userId,
        {
          online: online === "1",
          lastSeen: lastSeen ?? null,
        },
      ];
    })
  );

  return new Map(entries);
};

/**
 * Typing indicators are transient, so we rely on a short Redis TTL to clean up
 * stale state even if a client disconnects unexpectedly.
 */
export const setTypingIndicator = async (
  conversationId,
  userId
) => {
  const redis = getRedisClient();

  await redis.set(
    getTypingKey(conversationId, userId),
    "1",
    "EX",
    5
  );
};

export const clearTypingIndicator = async (
  conversationId,
  userId
) => {
  const redis = getRedisClient();

  await redis.del(
    getTypingKey(conversationId, userId)
  );
};
