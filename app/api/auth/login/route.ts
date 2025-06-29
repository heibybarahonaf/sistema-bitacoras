import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UsuarioService } from "../../../services/usuarioService";
import { AuthUtils } from "../../../common/utils/auth.utils";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { GeneralUtils } from "../../../common/utils/general.utils";
import { LoginDto } from "../../../dtos/login.dto";

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const parsed = LoginDto.safeParse(body);
        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const { correo, password, codigo } = parsed.data;
        const cookieStore = cookies();
        const token = (await cookieStore).get("codigo_token")?.value;

        if (!token) {
            throw new ResponseDto(401, "Token de verificación expirado");
        }

        const tokenInfo = AuthUtils.verificarTokenCodigo(token);
        if (tokenInfo.correo !== correo) {
            throw new ResponseDto(400, "El correo no coincide con el del token");
        }

        if (tokenInfo.codigo !== codigo) {
            throw new ResponseDto(400, "Código incorrecto");
        }

        const usuario = await UsuarioService.obtenerUsuarioPorCorreo(correo);
        const passwordValida = await AuthUtils.comparePassword(password, usuario.password);

        if (!passwordValida) {
            throw new ResponseDto(401, "Contraseña incorrecta");
        }

        const tokenSesion = AuthUtils.generarTokenSesion({ correo: usuario.correo, rol: usuario.rol }, 3600);
        const response = NextResponse.json(new ResponseDto(200, "Inicio de sesión exitoso"));

        response.cookies.set("session_token", tokenSesion, {
            httpOnly: true,
            secure: true,
            maxAge: 3600, 
            path: "/",
            sameSite: "lax",
        });

        response.cookies.set("codigo_token", "", {
            maxAge: 0,
            path: "/",
        });

        return response;

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
