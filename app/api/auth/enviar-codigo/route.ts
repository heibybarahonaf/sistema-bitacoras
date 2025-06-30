import { NextResponse } from "next/server";
import { AuthUtils } from "../../../common/utils/auth.utils";
import { GeneralUtils } from "../../../common/utils/general.utils";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { EmailService } from "../../../services/emailService";
import { UsuarioService } from "@/app/services/usuarioService";

export async function POST(req: Request) {
    
    try {
        
        const { correo } = await req.json();
        if (!correo) {
            throw new ResponseDto(400, "El Correo es requerido");
        }

        const usuario = await UsuarioService.obtenerUsuarioPorCorreo(correo);
        if(!usuario.activo){
            throw new ResponseDto(400, "El usuario no esta activo!");
        }

        const codigo = GeneralUtils.generarCodigo(6);
        const token = AuthUtils.generarTokenCodigo(correo, codigo, 600);

        await EmailService.enviarCodigoAcceso(correo, codigo);

        const response = NextResponse.json(new ResponseDto(200, "Código enviado con éxito"));
        response.cookies.set("codigo_token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 200,
            path: "/",
            sameSite: "lax",
        });

        return response;

    } catch (error) {
      
        return GeneralUtils.generarErrorResponse(error);

    }

}
