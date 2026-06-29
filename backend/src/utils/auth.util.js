import jwt from 'jsonwebtoken'
import env from "../config/env.js"

export const generateAccessToken = (userId)=>{

    const accessToken =  jwt.sign({userId}, env.JWT_ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
    return accessToken

}

export const generateRefreshToken =  (userId) => {
 const refreshToken =  jwt.sign({userId}, env.JWT_REFRESH_TOKEN_SECRET, {expiresIn: "7d"})
 return refreshToken    
}