import { Router } from "express";
import {user_signup} from '../controllers/signup.controller.ts';

export const signupRoute:Router = Router();

signupRoute.post('/signup',user_signup);