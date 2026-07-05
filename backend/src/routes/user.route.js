import {Router} from 'express'
import { searchUserByUsername } from '../controllers/user.controller.js'
import { authUser } from '../middlewares/auth.middleware.js'

const userRouter = Router()

userRouter.get("/search", authUser, searchUserByUsername)


export default userRouter
