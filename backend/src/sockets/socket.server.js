import {Server} from 'socket.io'
import { verifyAccessToken } from '../utils/auth.util.js'


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
        
    })
    
}