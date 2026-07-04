import * as authController from "../controllers/auth.controller.js"
import {Router} from 'express'
import * as authValidator from "../validator/auth.validator.js"

const authRouter = Router()


authRouter.post("/register",authValidator.registerUserValidator, authController.registerUser)

authRouter.post("/login", authValidator.loginUserValidator, authController.loginUser)

authRouter.post("/logout", authController.logoutUser)

export default authRouter
  