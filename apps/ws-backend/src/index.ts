import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from 'backend-common/config'
import { SrvRecord } from "dns";

const wss = new WebSocketServer({port:8080})

interface User {
    ws:WebSocket
    rooms:string[]
    userId:string

}

const users:User[] = [] 


function checkUser(token:string):string|null{
    const decoded = jwt.verify(token,JWT_SECRET as string)
    if(typeof decoded === 'string')
        return null

    if(!decoded)
        return null
    
    return decoded.userId
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
        ws:ws,
        rooms:[],
        userId:userId

    })
    
    ws.on('message',(message)=>{
        ws.send(message)
    })
})
