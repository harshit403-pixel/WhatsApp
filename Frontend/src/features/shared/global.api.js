import axios from "axios";

/**
 * Global axios instance.
 *
 * Base URL:
 * /api
 *
 * Examples:
 * globalApi.get("/rooms")
 * -> GET /api/rooms
 *
 * globalApi.post("/messages")
 * -> POST /api/messages
 */
const globalApi = axios.create({
  baseURL: "/api",

  /**
   * Sends cookies automatically.
   *
   * Required for:
   * - Refresh token cookie
   * - Session-based authentication
   * - Cross-origin requests with credentials
   */
  withCredentials: true,
});

export default globalApi;