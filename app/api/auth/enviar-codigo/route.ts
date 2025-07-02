import { NextResponse } from "next/server";
import { AuthUtils } from "@/app/common/utils/auth.utils";
import { EmailService } from "@/app/services/emailService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

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
