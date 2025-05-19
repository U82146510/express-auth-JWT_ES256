import { type Request,type Response,type NextFunction } from "express";
import z from 'zod';
import {User} from '../models/User.ts';


interface SignupType{
    email:string;
    password:string;
    role:'admin'|'user'|'moderator';
};

const signup = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    role:z.enum(['user','admin','moderator']).default('user'),
});

function signup_assert(arg:unknown):asserts arg is SignupType{
    if(typeof arg !== 'object' || arg === null
        || !('email' in arg) || !('password' in arg) ||
        typeof (arg as any).password !== 'string' ||
        typeof (arg as any).email !== 'string'
    ){
        throw new Error('Invalud signup_type')
    }
};

export const user_signup = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = signup.safeParse(req.body);
    if(!parsed.success){
        res.status(400).json({message:parsed.error.issues});
        return;
    }
    signup_assert(parsed.data);
    try {
        const existingUser = await User.findOne({email:parsed.data.email});
        if(existingUser){
            res.status(409).json({message:'This username already exists.'});
            return;
        }
        const user = await User.create({
            email:parsed.data.email,
            password:parsed.data.password,
            role:parsed.data.role});
        res.status(201).json({message:'Sign up successful',id:user._id});
    } catch (error) {
        next(error);
    }
};