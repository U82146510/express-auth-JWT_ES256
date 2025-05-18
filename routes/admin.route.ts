import { Router } from "express";
import {admin_route} from '../controllers/admin.controller.ts';
import {auth} from '../middleware/auth.middleware.ts';
import {authoriz} from '../middleware/authoriz.middleware.ts';

export const adminRoute:Router = Router();
adminRoute.get('/admin',auth,authoriz("admin"),admin_route);