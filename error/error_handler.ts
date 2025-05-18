import { type Request,type Response,type NextFunction } from "express"

interface ApiError{
    statusCode:number;
    message:string;
    details?:unknown;
    stack?:string;
    isOperational:boolean;
};

class ApiError extends Error implements ApiError{
    constructor(
        public message:string,
        public statusCode:number = 500,
        public details?:unknown,
        public isOperational:boolean = true,
    ){
        super(message);
        this.name = this.constructor.name;
        if(Error.captureStackTrace){
            Error.captureStackTrace(this,this.constructor)
        }
    }
};

export const error_handler = (err:unknown,req:Request,res:Response,next:NextFunction)=>{
    if(err instanceof ApiError){
        res.status(err.statusCode).json({error:err.name,message:err.message});
        return;
    }
    if(err instanceof Error){
        res.status(500).json({error:err.name,message:err.message});
        return;
    }

    res.status(500).json({message:'Internal server error.'});
};