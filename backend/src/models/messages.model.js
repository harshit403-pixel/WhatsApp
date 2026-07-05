import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema({
    conversation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"conversations",
        required:true,
        index:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    content:{
        type:String,
        trim:true,
        default:""
    },
    attachments:[{
        url:{
            type:String,
            trim:true
        },
        name:{
            type:String,
            trim:true
        },
        mimeType:{
            type:String,
            trim:true
        },
        size:{
            type:Number,
            min:0,
            default:0
        }
    }],
    status:{
        type:String,
        enum:["sending","sent","delivered","read"],
        default:"sent"
    },
    deliveredTo:[receiptSchema],
    readBy:[receiptSchema]

},{
    timestamps:true
})

messageSchema.index({
    conversation:1,
    createdAt:1
})

messageSchema.pre("validate", function () {
    if (!this.content?.trim() && !this.attachments.length) {
        this.invalidate(
            "content",
            "Message content or attachments are required"
        )
    }
})

const messageModel = mongoose.model("message", messageSchema)

export default messageModel
