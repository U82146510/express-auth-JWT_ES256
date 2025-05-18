import {type Request,type Response,type NextFunction} from 'express';

export const admin_route = (req:Request,res:Response,next:NextFunction)=>{
    try {
        res.status(200).json({message:'Welcome to admin panel'});
    } catch (error) {
        next(error);
    }
};