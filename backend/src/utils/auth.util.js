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


export const verifyAccessToken = (token) =>{
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET)
        return decoded
    } catch (error) {
        throw new Error("Invalid or expired access token");
        
    }  
}


export const verifyRefreshToken = (token) =>{
    try {
        const decoded = jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET)
        return decoded
        
    } catch (error) {
        throw new Error("Invalid refrsh token or expired");
        
    }
}