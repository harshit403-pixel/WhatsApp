import createApp from "./src/app.js";
import { createRedisCLient } from "./src/config/cache.js";
import { connectDb } from "./src/config/db.js";
import env from "./src/config/env.js";
import { createServer } from "http";
import { initializeSocketServer } from "./src/sockets/socket.server.js";

const PORT = env.PORT;
const app = createApp();

// Attach Express app to HTTP server
const server = createServer(app);

async function startServer() {
  try {
    await connectDb();
    console.log("MongoDB connected");

    await createRedisCLient();
    console.log("Redis connected");

    // Initialize Socket.IO
    initializeSocketServer(server);

    // Start the HTTP server, not app.listen
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();