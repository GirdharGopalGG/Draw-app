


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



app.listen(3001)
