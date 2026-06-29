import * as userDao from "../dao/user.dao.js"



export const registerUser = async(req,res)=>{
    const {username,password,email} = req.body

    const user = await userDao.createUser({username,password,email})
}