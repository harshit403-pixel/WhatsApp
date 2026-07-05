import messageModel from "../models/message.model.js";

export async function createMessage(messageData) {
    const message = await messageModel.create(messageData);
    return message;
}