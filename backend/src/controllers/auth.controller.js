import * as userDao from "../dao/user.dao.js"
import * as sessionDao from "../dao/session.dao.js"
import * as authUtils from "../utils/auth.util.js"
import env from '../config/env.js'


export const registerUser = async(req,res)=>{
    const {username,password,email} = req.body

    const isUserExists = await userDao.getUserByEmailOrUsername({username,email})

    if(isUserExists){
        return res.status(400).json({
            message:"User already Exists"
        })
    }

    const user = await userDao.createUser({username,password,email})

    const accessToken = authUtils.generateAccessToken(user._id)
    const refreshToken = authUtils.generateRefreshToken(user._id)

    await sessionDao.createSession({userId: user._id, refreshToken})

    res.cookie('refreshToken', refreshToken,{
        httpOnly:true,
        secure: env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 7*24*60*60*1000 // 7 days
    })

    return res.status(201).json({
        messgae:"user registered successfully",
        data:{
            user:{
                id: user._id,
                username:user.username,
                email:user.email
            },
            accessToken
        }
    })
}