import express,{type Application} from 'express';
import {error_handler} from './error/error_handler.ts';
import {connect_to_atlas} from './config/atlas.ts';

const app:Application = express();
app.use(express.json());
const port:number = 3000;



app.use(error_handler);
const start = async()=>{
    try {
        await connect_to_atlas();
        app.listen(3000,()=>console.log('Server On'));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();