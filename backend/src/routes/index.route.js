import { Router } from "express";
import  authRouter from "./auth.routes.js";
import userRouter from "./user.route.js";
import conversationRouter from "./conversation.route.js";


const indexRouter = Router()

indexRouter.use("/auth", authRouter)
indexRouter.use("/users", userRouter)
indexRouter.use("/conversations", conversationRouter)





export default indexRouter 
