import mongoose, { mongo } from "mongoose";

const conversationSchema = new mongoose.Schema({

    participants:[{
        type : mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }],
    lastMessageAt:{
        type: Date,
        
    }
},{
    timestamps:true
})

const conversationModel = mongoose.model("conversations", conversationSchema)
export default conversationModel