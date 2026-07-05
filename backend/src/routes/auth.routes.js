import * as authController from "../controllers/auth.controller.js"
import {Router} from 'express'
import * as authValidator from "../validator/auth.validator.js"
import { authUser } from "../middlewares/auth.middleware.js"

const authRouter = Router()


authRouter.post("/register",authValidator.registerUserValidator, authController.registerUser)

authRouter.post("/login", authValidator.loginUserValidator, authController.loginUser)

authRouter.post("/logout", authController.logoutUser)

authRouter.post("/refresh-token", authController.refreshTokenController)

authRouter.get("/current-user",authUser, authController.getMe)

export default authRouter
  