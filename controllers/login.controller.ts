import { type Request,type Response,type NextFunction } from "express";
import {z} from 'zod';
import { User } from "../models/User.ts";
import {JWTService} from '../auth/jwt.services.ts';
import {ApiError} from '../error/error_handler.ts'; 

interface LoginType{
    email:string;
    password:string;
}

const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
});

function login_assert(arg:unknown):asserts arg is LoginType{
    if(typeof arg !== 'object' || arg === null
        || !('email' in arg) || !('password' in arg) ||
        typeof (arg as any).password !== 'string' ||
        typeof (arg as any).email !== 'string'
    ){
        throw new Error('Invalud signup_type')
    }
};

export const user_login = async (req:Request,res:Response,next:NextFunction)=>{
    const parsed = loginSchema.safeParse(req.body);
    if(!parsed.success){
        res.status(400).json({error:'Validation failed',message:parsed.error.issues})
        return;
    }
    login_assert(parsed.data);
    try {
        const user = await User.findOne({email:parsed.data.email});
        if(!user ||!user.verify_password(parsed.data.password)){
           res.status(401).json({message:'Invalid user or password'});
           return; 
        }
        const accessToken = await JWTService.signToken({id:user._id as string,role:'admin'});
        const refreshToken = await JWTService.signRefreshToken({id:user._id as string,role:'admin'});
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:false,
            sameSite:'strict',
            maxAge:15 * 60 * 1000,
            path:'auth/login'
        });
        res.status(200).json({message:"logged in successfully",token:accessToken});
    } catch (error) {
        next(error instanceof ApiError ? error : new ApiError('Login error',500));
    }
};