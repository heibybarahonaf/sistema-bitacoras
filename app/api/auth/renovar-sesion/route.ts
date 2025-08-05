import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AuthUtils } from "@/app/common/utils/auth.utils";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { AuthEdgeUtils } from "@/app/common/utils/auth-edge.utils";

export async function POST() {

    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session_token")?.value;

        if (!sessionToken) {
            throw new ResponseDto(401, "No hay sesión activa");
        }

        const sesionPayload = await AuthEdgeUtils.verificarTokenSesion(sessionToken);
        const nuevoToken = AuthUtils.generarTokenSesion(
            { correo: sesionPayload.correo, rol: sesionPayload.rol },
            4 * 3600 
        );

        const response = NextResponse.json(new ResponseDto(200, "Sesión renovada"));

        response.cookies.set("session_token", nuevoToken, {
            httpOnly: true,
            secure: false,
            maxAge: 4 * 3600,
            path: "/",
            sameSite: "lax",
        });

        return response;

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
