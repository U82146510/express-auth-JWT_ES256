import {Document,model,Schema} from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document{
    email:string,
    password:string,
    role:'admin'|'user',
    verify_password(password:string):boolean;
};

const user_schema = new Schema<IUser>({
    email:{type:String,required:[true,'email is required'],lowercase:true,unique:true},
    password:{type:String,required:true,minlength:6},
    role:{type:String,enum:['admin','user'],default:'user'}
});

user_schema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

user_schema.methods.verify_password = async function(password:string):Promise<boolean>{
    try {
        if(!password||!this.password){
            console.log('Password verification attempt with missing inputs');
            return false;
        }
        const compare_password = await bcrypt.compare(password,this.password);
        return compare_password;
    } catch (error) {
        await bcrypt.compare("dummy", "$2a$10$dummyhash");
        return false;
    }
};

export const User = model<IUser>('Signup',user_schema);