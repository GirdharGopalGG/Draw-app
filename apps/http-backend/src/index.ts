


import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "backend-common/config"
import {createRoomSchema, createUserSchema, signInSchema} from "common/types"

import {prismaClient} from "db/client"
import { middleware } from "./middleware"

const app = express()

app.use(express.json())

app.post('/signup',async (req,res)=>{
    //db call

    const parsedData = createUserSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(411).json({
            msg:"incorrect input"
        })
        return
    }

    try{
       const user=  await prismaClient.user.create({
        
            data:{
                email:parsedData.data.username,
                password:parsedData.data.password,
                name:parsedData.data.name
            }
        })
    
        res.json({
            msg:user.id
        })

    }catch(e){
        res.status(411).json({
            msg:"user already exists"
        })
    }
})

app.post('/signin',async (req,res)=>{

    const parsedData = signInSchema.safeParse(req.body)
    if(!parsedData.success){
        res.json({
            msg:"incorrect inputs"
        })
        return
    }


    try{
            
        const user = await prismaClient.user.findFirst({
            where:{
                email:parsedData.data.username,
                password:parsedData.data.password
            }
        }) 

        if(!user){
            res.json({
                msg:"user doesn't exists"
            })
            return
        }
        
        const token = jwt.sign({
             userId : user.id
        }
         ,JWT_SECRET as string)
    
    res.json({
        token
    })
    }catch(e){
        res.status(411).json({
            msg:"email/password incorrect"
        })
    }
    
   
})

app.post('/room',middleware,async (req,res)=>{
     // db call

     const parsedData = createRoomSchema.safeParse(req.body)
     if(!parsedData.success){
        res.json({
            msg:"incorrect inputs"
        })
        return
     }
     
     //@ts-ignore
     const userId = req.userId

     try{
        const room = await prismaClient.room.create({
        data:{
            slug:parsedData.data.roomName,
            adminId:userId
        }
     })
     res.json({
        roomId:room.id
     })
     }catch(e){
        res.status(411).json({
            msg:"room already exists"
        })
     }
          
})

app.get('/chats/:roomId',async (req,res)=>{
    const roomId = Number(req.params.roomId)
    
    try{

        const chats = await prismaClient.chat.findMany({

            where:{
                roomId:roomId
            },
            orderBy:{
                id:"desc"
            },        
            take:50
        })

        res.json({
            chats
        })
    }catch(e){
        res.status(411).json({
            msg:"error fetching previous chats"
        })
    }
    
})

app.get('/room/:roomName',async(req,res)=>{
    const roomName = req.params.roomName
    try{
        const room = await prismaClient.room.findFirst({
        where:{
            slug:roomName
        }
        })
        if(room===null){
            res.status(411).json({
                msg:"room not found"
            })
            return
        }
        res.json({
            roomId:room.id
        })
    }catch(e){
        res.status(411).json({
            msg:"error finding roomId"
        })
    }
    
})


app.listen(3001)
