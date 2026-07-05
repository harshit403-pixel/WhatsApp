import userModel from "../models/user.model.js";

export const createUser = async({username, password, email})=>{

    const user = await userModel.create({
        username,password,email
    })

    return user

}


export const getUserByEmailOrUsername = async({username,email})=>{

    const user = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    })

    return user

}



export const getUserById = async (userId) => {
    const user = await userModel.findById(userId)

    return user
}


// search users by username
 
export const searchUsersByUsername = async (username) => {
    const users = await userModel.find({
        username: { $regex: username, $options: 'i' }
    }).select('username email'); // just include name and email in the result
    return users;
}