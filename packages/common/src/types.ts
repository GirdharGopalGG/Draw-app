import {z} from "zod"

// INPUTS ARE BASED ON ZOD SCHEMA AND NOT PRISMA.SCHEMA

export const createUserSchema = z.object({      
    username:z.string().min(3).max(20),
    password:z.string(),
    name:z.string()
})

export const signInSchema = z.object({
    username:z.string().min(3).max(20),
    password:z.string()
})

export const createRoomSchema = z.object({
    roomName:z.string().min(3).max(20)
})
