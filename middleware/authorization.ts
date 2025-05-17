import { type Request,type Response,type NextFunction } from "express";

export const authoriz =(role:'admin'|'moderator'|'user')=> (req:Request,res:Response,next:NextFunction)=>{
    try {
        if(role!==req.user?.role){
            res.status(403).json({error:'Forbidden',message:'You have insufficient permission'});
            return;
        }
        next()
    } catch (error) {
        console.error(error)
    }
};