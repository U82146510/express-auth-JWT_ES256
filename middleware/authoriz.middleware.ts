import { type Request,type Response,type NextFunction } from "express";


const rolesHierarchy = ['user', 'moderator', 'admin'] as const;

export const authoriz =(requiredRole:'admin'|'moderator'|'user')=> (req:Request,res:Response,next:NextFunction)=>{
    try {
        const userRole = req.user?.role;
        if(!userRole){
            res.status(401).json({error:'Unauthorized',message:'No user role found'});
            return;
        }
        if(rolesHierarchy.indexOf(userRole)<rolesHierarchy.indexOf(requiredRole)){
            res.status(403).json({error:'Forbidden',message:'Insufficient permission'});
            return;
        }
        next();
    } catch (error) {
        console.error(error)
        next(error);
    }
};