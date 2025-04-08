import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "backend-common/config";

export function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers.token as string

    const decoded = jwt.verify(token,JWT_SECRET as string)

    if(decoded){
        //@ts-ignore
        req.userId = decoded.userId
        next()
        

    }else{
        res.status(403).json({
            msg:"Unauthorized"
        })
    }

}