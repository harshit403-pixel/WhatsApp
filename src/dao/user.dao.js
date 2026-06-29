import userModel from "../models/user.model.js";

export const createUser = async({username, password, email})=>{

    const user = await userModel.create({
        username,password,email
    })

    return user

}
