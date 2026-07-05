import {Server} from 'socket.io'


export function initializeSocketServer(httpServer) {

    const io = new Server(httpServer)

    io.on("connection", (socket)=>{
        console.log("A user connected:", socket.id)
        
    })
    
}