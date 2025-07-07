import { jwtVerify } from 'jose';
import { ISesionPayload } from './auth.utils';
import { ResponseDto } from '../dtos/response.dto';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export class AuthEdgeUtils {
    
    public static async verificarTokenSesion(token: string): Promise<ISesionPayload> {

        try {

            const { payload } = await jwtVerify(token, secret);
            const { correo, rol, exp } = payload as { correo?: string; rol?: string; exp?: number };

            if (typeof correo !== 'string' || typeof rol !== 'string') {
                throw new ResponseDto(401, "Sesión inválida o expirada");
            }

            return { correo, rol, exp } as ISesionPayload;

        } catch {

            throw new ResponseDto(401, "Sesión inválida o expirada");
        }

    }

}
