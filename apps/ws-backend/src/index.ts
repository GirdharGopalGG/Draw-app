import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from 'backend-common/config'
import {prismaClient} from 'db/client'

const wss = new WebSocketServer({port:8080})

interface User {
    ws:WebSocket
    rooms:string[]
    userId:string

}

const users:User[] = [] 


function checkUser(token:string):string|null{
    try{
        const decoded = jwt.verify(token,JWT_SECRET as string)
        if(typeof decoded === 'string')
            return null

        if(!decoded)
            return null
        
        return decoded.userId
        
    }catch(e){
        return null
    }
    
}


wss.on('connection',(ws,request)=>{
        
    const url = request.url
    if(!url){
        return
    }

    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') as string
    const userId = checkUser(token)
    
    if(!userId){
        ws.close()
        return
    }
    
    users.push({
        ws,
        rooms:[],
        userId

    })
    
    ws.on('message',async (message)=>{
        
        const parsedData = JSON.parse(message as unknown as string)
        if(parsedData.type === 'join_room'){
            const user = users.find(x=>x.ws === ws) //checks if user is authenticatedly connected to the ws
            user?.rooms.push(parsedData.roomId)
        }

        if(parsedData.type === 'leave_room'){
            const user = users.find(x => x.ws === ws)
            if(!user)
                return

            user.rooms = user?.rooms.filter(x=>x!==parsedData.roomId)
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId
            const msg = parsedData.message


            await prismaClient.chat.create({
                data:{
                     message:msg,
                     roomId,
                     userId
                }
            })
            
            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:msg,
                        roomId
                    }))
                }
            })
        }
        
    })
})
