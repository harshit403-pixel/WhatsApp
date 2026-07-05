import { Router } from "express";
import  authRouter from "./auth.routes.js";
import userRouter from "./user.route.js";


const indexRouter = Router()

indexRouter.use("/auth", authRouter)
indexRouter.use("/users", userRouter)





export default indexRouter 