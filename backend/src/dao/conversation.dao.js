import conversationModel from "../models/conversation.model.js"

const conversationPopulate = [
    {
        path:"participants",
        select:"username email"
    },
    {
        path:"admins",
        select:"username email"
    }
]

export async function createConversation(conversationData = {}){
    const conversation = await conversationModel.create(conversationData)
    return conversation
}

export  async function getConversationById(conversationId){
    const conversation = await conversationModel
        .findById(conversationId)
        .populate(conversationPopulate)
    return conversation
}

export async function getConversationByUserId(userId){
    const conversations = await conversationModel.find({
        participants: userId
    })
    return conversations
}

export async function listConversationPeers(userId){
    return conversationModel.find({
        participants:userId
    }).select("participants")
}

export async function listConversationsForUser(userId){
    return conversationModel
        .find({
            participants:userId
        })
        .populate(conversationPopulate)
        .sort({
            lastMessageAt:-1,
            updatedAt:-1
        })
}

export async function findPrivateConversationByParticipants(participants = []){
    const conversation = await conversationModel
        .findOne({
            isGroup:false,
            participants:{
                $all: participants,
                $size: participants.length
            }
        })
        .populate(conversationPopulate)
    return conversation
}
