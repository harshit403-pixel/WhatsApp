import messageModel from "../models/messages.model.js";

const messagePopulate = [
    {
        path:"sender",
        select:"username email"
    }
]

export async function createMessage(messageData) {
    const message = await messageModel.create(messageData);
    return message;
}

export async function getMessageById(messageId){
    return messageModel
        .findById(messageId)
        .populate(messagePopulate)
}

export async function listMessagesByConversation(conversationId){
    return messageModel
        .find({
            conversation: conversationId
        })
        .populate(messagePopulate)
        .sort({
            createdAt:1
        })
}
