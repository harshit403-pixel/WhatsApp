import {Server} from 'socket.io'
import { verifyAccessToken } from '../utils/auth.util.js'
import * as conversationDao from '../dao/conversation.dao.js'
import * as messageDao from '../dao/message.dao.js'

export function initializeSocketServer(httpServer) {

    const io = new Server(httpServer)

    io.use((socket, next)=>{

        const token = socket.handshake.headers.authorization?.split(" ")[ 1 ]

        if(!token){
            return next(new Error("Authentication error:No token Provided"))
        }
        try {
            const decoded = verifyAccessToken(token)
            socket.userId = decoded.userId
            next()
        } catch (error) {
            return next(new Error ("authenticaiton error : invalid token"))
        }
    })

    io.on("connection", (socket)=>{
        console.log("A user connected:", socket.id)

        // make user join room with their user id so we can sed nmessgae to them specifically
        socket.join(socket.userId)

        socket.on("sendMessage",async (data)=>{

            const isConversationExist =await conversationDao.getConversationByParticipants([socket.userId,data.receiver])


            let conversationId = isConversationExists?._id;


            if(!isConversationExist){
               const conversation = await conversationDao.createConversation([socket.userId,data.receiver])
               conversationId = conversation._id
            }

            await messageDao.createMessage({
                conversationId: isConversationExist?._id || conversationId,
                sender: socket.userId,
                receiver: data.receiver,
                content: data.content
            })

            const receiver = data.receiver



            io.to(receiver).timeout(10000).emit("recieveMessage", data, (err, response)=>{

                console.log("Message sent to receiver:", receiver, "Response:", response, "Error:", err)
            })
            

        })


        socket.on("disconnect",()=>{
            console.log("A user Disconnted:", socket.userId)
            socket.leave(socket.userId)
            
        })
        
    })
    
}