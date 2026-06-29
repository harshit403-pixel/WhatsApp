import * as authController from "../controllers/auth.controller"
import {Router} from 'express'
import * as authValidator from "../validator/auth.validator.js"

const authRouter = Router()

authRouter.post("/register",authValidator.registerUserValidator, authController.registerUser)
  