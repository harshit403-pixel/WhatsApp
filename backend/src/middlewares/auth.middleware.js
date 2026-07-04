import * as authUtils from "../utils/auth.util.js"


export const authUser = async (req, res, next ) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if(!accessToken){
        return res.status(401).json({
            message:"Access Token is missing"
        })
    }
    try{
        const decoded = authUtils.verifyAccessToken(accessToken)
        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(401).json({
            message:"Invalid Access Token"
        })
    }
}