import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    conversationId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"conversations",
        required:true,
        index:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    content:{
        type:String,
        required:true
    },
    delivered:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})

const messageModel = mongoose.model("message", messageSchema)

export default messageModel