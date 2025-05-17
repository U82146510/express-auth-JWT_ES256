import { z } from "zod";

interface JWTconfig{
    PRIVATE_KEY_PATH:string;
    PUBLIC_KEY_PATH:string;
    JWT_EXPIRES_IN:string;
    JWT_REFRESH_EXPIRE_IN:string;
    JWT_ISSUER:string;
    JWT_AUDIENCE:string;
};

const EnvSchema = z.object({
    PRIVATE_KEY_PATH:z.string().min(1),
    PUBLIC_KEY_PATH:z.string().min(1),
    JWT_EXPIRES_IN:z.string().min(1),
    JWT_REFRESH_EXPIRE_IN:z.string().min(1),
    JWT_ISSUER:z.string().min(1),
    JWT_AUDIENCE:z.string().min(1),
});

export function loadProductionEnv():JWTconfig{
    const parsed = EnvSchema.safeParse(process.env);
    if(!parsed.success){
        throw new Error("Invalid environment variables:\n" + JSON.stringify(parsed.error.format(), null, 2));
    }

    return {
        PRIVATE_KEY_PATH:parsed.data.PRIVATE_KEY_PATH,
        PUBLIC_KEY_PATH:parsed.data.PUBLIC_KEY_PATH,
        JWT_EXPIRES_IN:parsed.data.JWT_EXPIRES_IN,
        JWT_REFRESH_EXPIRE_IN:parsed.data.JWT_REFRESH_EXPIRE_IN,
        JWT_ISSUER:parsed.data.JWT_ISSUER,
        JWT_AUDIENCE:parsed.data.JWT_AUDIENCE,

    } as const
};

