import mongoose from "mongoose";
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path:path.resolve(__dirname,'../../.env')});

const atlas = process.env.atlas_uri;
if(!atlas){
    throw new Error("missing atlas connection string");
}

export const connect_to_atlas = async()=>{
    try {
        await mongoose.connect(atlas,{
            serverSelectionTimeoutMS:5000,
            socketTimeoutMS:30000,
            maxPoolSize:50,
            minPoolSize:5,
            retryWrites:true,
            retryReads:true,
            connectTimeoutMS:10000,
            heartbeatFrequencyMS:30000,
            tls:true,
            tlsAllowInvalidCertificates:false,
            bufferCommands:false,
            waitQueueTimeoutMS: 10000,

        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const db:mongoose.Connection=mongoose.connection;

db.on('error',(error:Error)=>{
    console.error(error);
});
db.on('connected',()=>{
    console.log('connected to atlas');
});
db.on('disconnected',()=>{
    console.log('disconnected from atlas');
});
db.on('reconnected',()=>{
    console.log('reconnected to atlas');
});

process.on("SIGINT",async()=>{
    await db.close();
    process.exit(0);
});