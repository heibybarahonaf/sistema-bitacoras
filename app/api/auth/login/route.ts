export const runtime = 'nodejs';

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { LoginDto } from "@/app/dtos/login.dto";
import { AuthUtils } from "@/app/common/utils/auth.utils";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

// sin campo código
const LoginSimpleDto = LoginDto.omit({ codigo: true });

export async function POST(req: Request) {

    try {

        const body = await req.json();
        
        // DTO sin código
        const parsed = LoginSimpleDto.safeParse(body);
        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const { correo, password } = parsed.data;

        // VALIDACIÓN DEL TOKEN Y CÓDIGO
        // const cookieStore = cookies();
        // const token = (await cookieStore).get("codigo_token")?.value;

        // if (!token) {
        //     throw new ResponseDto(401, "Token de verificación expirado");
        // }

        // const tokenInfo = AuthUtils.verificarTokenCodigo(token);
        // if (tokenInfo.correo !== correo) {
        //     throw new ResponseDto(400, "El correo ingresado no coincide con el correo de solicitud del codigo");
        // }

        // if (tokenInfo.codigo !== codigo) {
        //     throw new ResponseDto(400, "Código incorrecto");
        // }

        const usuario = await UsuarioService.obtenerUsuarioPorCorreo(correo);
        const passwordValida = await AuthUtils.comparePassword(password, usuario.password);

        if (!passwordValida) {
            throw new ResponseDto(401, "Contraseña incorrecta");
        }

        const tokenSesion = AuthUtils.generarTokenSesion({ correo: usuario.correo, rol: usuario.rol }, 4 * 3600);
        const response = NextResponse.json(new ResponseDto(200, "Inicio de sesión exitoso"));
        
        response.cookies.set("session_token", tokenSesion, {
            httpOnly: true,
            secure: false,
            maxAge: 4 * 3600, 
            path: "/",
            sameSite: "lax",
        });

        // código_token de momento no
        // response.cookies.set("codigo_token", "", {
        //     maxAge: 0,
        //     path: "/",
        // });

        return response;

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}