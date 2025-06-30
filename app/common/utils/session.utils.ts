import { cookies } from "next/headers";
import { AuthUtils, ISesionPayload } from "../utils/auth.utils";
import { ResponseDto } from "../dtos/response.dto";

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
