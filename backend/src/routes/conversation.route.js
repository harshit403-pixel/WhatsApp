import { Router } from "express";

import { authUser } from "../middlewares/auth.middleware.js";
import * as conversationController from "../controllers/conversation.controller.js";

const conversationRouter = Router();

conversationRouter.use(authUser);

conversationRouter.get(
  "/",
  conversationController.listConversations
);
conversationRouter.post(
  "/private",
  conversationController.getOrCreatePrivateConversation
);
conversationRouter.post(
  "/group",
  conversationController.createGroupConversation
);
conversationRouter.get(
  "/:conversationId/messages",
  conversationController.getConversationMessages
);
conversationRouter.post(
  "/:conversationId/read",
  conversationController.markConversationRead
);
conversationRouter.patch(
  "/:conversationId/group",
  conversationController.renameGroupConversation
);
conversationRouter.post(
  "/:conversationId/members",
  conversationController.addGroupMembers
);
conversationRouter.delete(
  "/:conversationId/members/:memberId",
  conversationController.removeGroupMember
);
conversationRouter.post(
  "/:conversationId/leave",
  conversationController.leaveGroupConversation
);

export default conversationRouter;
