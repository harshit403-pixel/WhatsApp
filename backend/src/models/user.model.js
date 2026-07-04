import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { lowercase } from "zod";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        index:true,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        index:true,
        lowercase:true,
        trim:true

    },
    password:{
        type:String,
        required:true,
        trim:true
    }
},{
    timestamps:true
})


//why do we use pre instaead of doing it in controller
// No matter where a user is created or saved in your application, the password is guaranteed to be hashed. This keeps your controllers clean and prevents security bugs.

userSchema.pre('save', async function (password) {
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    
    }  
    
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password , this.password)
    
}

const userModel = mongoose.model("user", userSchema)

export default userModel 