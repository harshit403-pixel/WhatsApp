import * as userDao from "../dao/user.dao.js"
import * as sessionDao from "../dao/session.dao.js"
import * as authUtils from "../utils/auth.util.js"
import env from '../config/env.js'
import { getRedisClient } from "../config/cache.js"


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

    const session =
      await sessionDao.updateSessionbyUserId(
        user._id,
        refreshToken
      )

    if(!session){
        await sessionDao.createSession({
            userId:user._id,
            refreshToken
        })
    }

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
        const decoded = authUtils.verifyRefreshToken(refreshToken)

        await sessionDao.deleteSessionByUserId(decoded.userId)

        res.clearCookie('refreshToken',{
            httpOnly:true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        return res.status(200).json({
            message:"user logged out successfully"
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

      const isRefreshTokenValid = await session.compareRefreshToken(refreshToken)

      if(!isRefreshTokenValid){
        return res.status(400).json({
            message:"Invalid refresh token"
        })
      }
      const newAccessToken = authUtils.generateAccessToken(decoded.userId)
      const newRefreshToken = authUtils.generateRefreshToken(decoded.userId)

      await sessionDao.updateSessionbyUserId(
  decoded.userId,
  newRefreshToken
);

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


export const getMe = async (req, res) => {
  const userId = req.userId;
  const redis = getRedisClient();

  // Redis key
  const cacheKey = `user:${userId}`;

  // Try getting user from Redis first
  const cachedUser = await redis.get(cacheKey);

  if (cachedUser) {
    return res.status(200).json({
      message: "user data retrieved successfully",
      data: {
        user: JSON.parse(cachedUser),
      },
    });
  }

  // If not found in cache, fetch from MongoDB
  const user = await userDao.getUserById(userId);

  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  const userData = {
    id: user._id,
    username: user.username,
    email: user.email,
  };

  // Store in Redis for 1 hour
  await redis.set(
    cacheKey,
    JSON.stringify(userData),
    "EX",
    60 * 60
  );

  return res.status(200).json({
    message: "user data retrieved successfully",
    data: {
      user: userData,
    },
  });
};
