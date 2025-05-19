import { type Request,type Response,type NextFunction } from "express";
import { JWTService,type JwtPayload } from "../auth/jwt.services.ts";

function isValidPayload(arg:unknown):arg is JwtPayload{
    return(
        typeof arg ==='object' && 
        arg!==null &&
        'id' in arg &&
        'role' in arg &&
        (arg as any).role &&
        ['admin','user','moderator'].includes((arg as any).role)
    )
};

export const auth = async(req:Request,res:Response,next:NextFunction)=>{
        const authHeader = req.headers.authorization;

        if(!authHeader?.startsWith('Bearer ')){
            res.status(401).json({error:'Invalid header',message:'Authorization header must be: Bearer <token>'});
            return;
        }
        const token = authHeader.split(' ')[1];
      
    try {
        const decoded = await JWTService.verify(token);
        if(!isValidPayload(decoded)){
            res.status(403).json({error:'Invalid token',message:'Malformed token payload'});
            return;
        }
        console.log(decoded)
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message:'error, Invalid token'});      
    }
};