import * as userDao from "../dao/user.dao.js"
import * as sessionDao from "../dao/session.dao.js"
import * as authUtils from "../utils/auth.util.js"



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