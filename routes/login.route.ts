import { Router } from "express";
import {user_login} from '../controllers/login.controller.ts';

export const loginRoute:Router = Router();

loginRoute.post('/login',user_login);