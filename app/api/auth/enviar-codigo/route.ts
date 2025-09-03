import { NextResponse } from "next/server";
import { AuthUtils } from "@/app/common/utils/auth.utils";
import { EmailService } from "@/app/services/emailService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function POST(req: Request) {
  try {
    console.log("Recibiendo petición...");

    const { correo } = await req.json();
    console.log("Correo recibido:", correo);

    if (!correo) throw new ResponseDto(400, "El Correo es requerido");

    const usuario = await UsuarioService.obtenerUsuarioPorCorreo(correo);
    console.log("Usuario encontrado:", usuario);

    if (!usuario?.activo) throw new ResponseDto(400, "El usuario no está activo");

    const codigo = GeneralUtils.generarCodigo(6);
    const token = AuthUtils.generarTokenCodigo(correo, codigo, 600);
    console.log("Código generado:", codigo);

    await EmailService.enviarCodigoAcceso(correo, codigo);
    console.log("Correo enviado");

    const response = NextResponse.json(new ResponseDto(200, "Código enviado con éxito"));
    response.cookies.set("codigo_token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("Error en /enviar-codigo:", error);
    return GeneralUtils.generarErrorResponse(error);
  }
}
