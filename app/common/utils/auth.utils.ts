import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import { ResponseDto } from "../dtos/response.dto";

export interface ITokenCodigoPayload {
    correo: string;
    codigo: string;
    iat: number;
    exp: number;
}

export interface ISesionPayload {
    correo: string;
    rol: string;
    iat: number;
    exp: number;
}

export class AuthUtils {

    public static async hashPassword(password: string): Promise<string> {

        return await bcrypt.hash(password, 10);

    }


    public static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {

        return await bcrypt.compare(password, hashedPassword);

    }

    
    public static generarTokenCodigo(correo: string, codigo: string, duracionSegundos: number): string {

        const payload: Omit<ITokenCodigoPayload, "iat" | "exp"> = { correo, codigo };
        return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: duracionSegundos });

    }


    public static verificarTokenCodigo(token: string): ITokenCodigoPayload {

        try {

            return jwt.verify(token, process.env.JWT_SECRET!) as ITokenCodigoPayload;

        } catch {

            throw new ResponseDto(401, "Código inválido o expirado");
        
        }
        
    }

    
    public static generarTokenSesion(payload: { correo: string; rol: string }, duracionSegundos: number): string {

        const datos: Omit<ISesionPayload, "iat" | "exp"> = {
            correo: payload.correo,
            rol: payload.rol,
        };

        return jwt.sign(datos, process.env.JWT_SECRET!, { expiresIn: duracionSegundos }); 

    }
    

    public static verificarTokenSesion(token: string): ISesionPayload {

        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as ISesionPayload; 
            return decoded;

        } catch {

            throw new ResponseDto(401, "Sesión inválida o expirada");

        }

    }

}
