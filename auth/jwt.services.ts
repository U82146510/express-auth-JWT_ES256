import {SignJWT,jwtVerify,type JWTPayload} from 'jose';
import fs from 'fs';
import {loadProductionEnv} from '../config/env.ts';

const env = loadProductionEnv()

const loadKey = (keyPath:string,permission?:number):string=>{  // loading the key from 
    if(!fs.existsSync(keyPath)){                               // '/etc/node_jwt/ssl'.
        throw new Error(`Key missing at path ${keyPath}`);
    }

    if(permission && process.platform!=='win32'){
        const mode = fs.statSync(keyPath).mode & 0o777; // get the permision from methadata.
        if(mode!==permission){
            throw new Error(`Insecure key permissions ${mode.toString(8)}`);
        }
    }
    return fs.readFileSync(keyPath,"utf8"); // if all verification passed then read the file.
};

const privateKey = loadKey(env.PRIVATE_KEY_PATH,0o400);
const publicKey = loadKey(env.PUBLIC_KEY_PATH,0o444);

const JWT_CONFIG = {
    algorithm:'ES256' as const,
    expiresIn:env.JWT_EXPIRES_IN,
    refreshExpiresIn:env.JWT_REFRESH_EXPIRE_IN,
    issuer:env.JWT_ISSUER,
    audience:env.JWT_ISSUER
};

export interface JwtPayload extends JWTPayload{
    id:string;
    role:'admin'|'moderator'|'user';
};

export class JWTService{
    private static async getPrivateKey(){
        const {importPKCS8} = await import('jose');
        return importPKCS8(privateKey,'ES256');
    };
    private static async getPublicKey(){
        const { importSPKI } = await import('jose');
        return importSPKI(publicKey, 'ES256');
    };
    static async signToken(payload:JwtPayload):Promise<string>{
        return new SignJWT(payload)
        .setProtectedHeader({alg:JWT_CONFIG.algorithm})
        .setIssuedAt()
        .setExpirationTime(JWT_CONFIG.expiresIn)
        .setIssuer(JWT_CONFIG.issuer)
        .setAudience(JWT_CONFIG.audience)
        .sign(await this.getPrivateKey());
    };
    static async signRefreshToken(payload:JwtPayload):Promise<string>{
        return new SignJWT({...payload,isRefresh:true})
        .setProtectedHeader({alg:JWT_CONFIG.algorithm})
        .setIssuedAt()
        .setExpirationTime(JWT_CONFIG.refreshExpiresIn)
        .setIssuer(JWT_CONFIG.issuer)
        .setAudience(JWT_CONFIG.audience)
        .sign(await this.getPrivateKey());
    };
    static async verify(token:string):Promise<JWTPayload>{
        const {payload} = await jwtVerify(token,
            await this.getPublicKey(),
        {
            algorithms:[JWT_CONFIG.algorithm],
            issuer:JWT_CONFIG.issuer,
            audience:JWT_CONFIG.audience
        });
        if((payload as any).isRefresh){
            throw new Error('Refresh token used as access token');
        }
        return payload as JWTPayload
    };
    static async refresh(refreshToken:string):Promise<{accessToken:string;refreshToken:string;}>{
        const {payload} = await jwtVerify(refreshToken,
            await this.getPublicKey(),
            {
                algorithms:[JWT_CONFIG.algorithm],
                issuer:JWT_CONFIG.issuer,
                audience:JWT_CONFIG.audience,
            }
        );
        if(!(payload as any).isRefresh){
            throw new Error('Invalid refresh token');
        }
        return {
            accessToken:await this.signToken(payload as JwtPayload),
            refreshToken:await this.signRefreshToken(payload as JwtPayload),
        }
    }
};

