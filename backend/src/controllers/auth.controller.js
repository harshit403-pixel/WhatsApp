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



export const loginUser = async(req, res)=>{
    const {email,password} = req.body;

    const user = await userDao.getUserByEmailOrUsername({
        email
    })
    if(!user){
        return res.status(400).json({
            message:"Invalid Email or Password"
        })
    }

    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid Email or Password"

        })
    }


    const accessToken = authUtils.generateAccessToken(user._id)
    const refreshToken = authUtils.generateRefreshToken(user._id)

    await sessionDao.updateSessionbyUserId(user._id,refreshToken)

    res.cookie('refreshToken', refreshToken,{
        httpOnly:true,
        secure: env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 7*24*60*60*1000 // 7 days
    })

    return res.status(200).json({
        message:"user loggeed in successfully",
        data:{
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            },
            accessToken
        }
    })

}    



export const logoutUser = async(req,res)=>{
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
            message:"refresh token not found"
        })
    }
    
    try {
        const decoded = authUtils.generateRefreshToken(refreshToken)

        await sessionDao.deleteSessionByUserId(decoded.userId)

        res.clearCookie('refreshToken',{
            httpOnly:true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

    } catch (error) {
        return res.status(400).json({
            message:"invalid or expired refresh token"
        })
    }
    
}



export const refreshTokenController = async (req,res) => {
    
    const refreshToken =  req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
            message:"refresh token not found"
        })
    }

    try {
      const decoded = authUtils.verifyRefreshToken(refreshToken)

      const session = await sessionDao.getSessionByUserId(decoded.userId)

      if(!session){
        return res.status(400).json({
            message:"session not found"
        })
      }

      const isRefreshTokenValid = session.compareRefreshToken(refreshToken)

      if(!isRefreshTokenValid){
        return res.status(400).json({
            message:"Invalid refresh token"
        })
      }
      const newAccessToken = authUtils.generateAccessToken(decoded.userId)
      const newRefreshToken = authUtils.generateRefreshToken(decoded.userId)

      await sessionDao.updateSessionbyUserId(decoded.userId,{ refreshToken: newRefreshToken})

      res.cookie('refreshToken', newRefreshToken,{
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7*24*60*60*1000
      })

      return res.status(200).json({
        message:"token refreshed succkessfully",
        data:{
            accessToken:newAccessToken
        }
      })


    } catch (error) {
     return res.status(400).json({
            message:"invalid or expired refresh token"
        })
    }
}


export const getMe = async (req,res) => {

    const userId = req.userId

    const user = await userDao.getUserById(userId)

    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }

    return res.status(200).json({
       message: "user data retrieved successfully",
        data:{
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        }
    })
    
}