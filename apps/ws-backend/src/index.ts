import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken"
import {JWT_SECRET} from 'backend-common/config'

const wss = new WebSocketServer({port:8080})

wss.on('connection',(ws,request)=>{
    
    const url = request.url
    if(!url){
        return
    }

    const queryParam = new URLSearchParams(url.split('?')[1])
    const token = queryParam.get('token') as string
    
    const decoded = jwt.verify(token,JWT_SECRET)

    if(!decoded){
        ws.close()
        return
    }
    
    ws.on('message',(message)=>{
        ws.send(message)
    })
})
