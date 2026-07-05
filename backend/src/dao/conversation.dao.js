import conversationModel from "../models/conversation.model.js"


export async function createConversation(participants = []){
    const conversation = await conversationModel.create({
        participants
    })
    return conversation
}

export  async function getConversationById(conversationId){
    const conversation = await conversationModel.findById(conversationId)
    return conversation
}

export async function getConversationByUserId(userId){
    const conversations = await conversationModel.find({
        participants: { $in: [userId] }
    })
    return conversations
}

export async function getConversationByParticipants(participants = []){
    const conversation = await conversationModel.findOne({
        participants: { $all: participants }
    })
    return conversation
}