import * as userDao from "../dao/user.dao.js"



export const registerUser = async(req,res)=>{
    const {username,password,email} = req.body

    const isUserExists = await userDao.getUserByEmailOrUsername({username,email})

    if(isUserExists){
        return res.status(400).json({
            message:"User already Exists"
        })
    }

    const user = await userDao.createUser({username,password,email})
}