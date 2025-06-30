import { cookies } from "next/headers";
import { ResponseDto } from "../dtos/response.dto";
import { AuthUtils, ISesionPayload } from "../utils/auth.utils";

export async function obtenerPayloadSesion(): Promise<ISesionPayload> {

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;

        if (!token) {
            throw new ResponseDto(401, "Usuario no autenticado, Inicia Sesión!");
        }

        const payload = AuthUtils.verificarTokenSesion(token);
        return payload;

    } catch {

        throw new ResponseDto(401, "Sesión inválida o expirada");
        
    }

}
