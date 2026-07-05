import {Router} from 'express'
import { searchUserByUsername } from '../controllers/user.controller.js'

const userRouter = Router()

userRouter.get("/search", searchUserByUsername)


export default userRouter