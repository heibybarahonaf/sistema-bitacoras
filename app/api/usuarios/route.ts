import { NextResponse } from "next/server";
import { ResponseDto } from "../../common/dtos/response.dto";
import { GeneralUtils } from "../../common/utils/general.utils";
import { CrearUsuarioDto } from "../../dtos/usuario.dto";
import { UsuarioService } from "../../services/usuarioService";

export async function GET() {

    try {

        const usuarios = await UsuarioService.obtenerUsuarios();
        return NextResponse.json(new ResponseDto(200, "Usuarios obtenidos correctamente", usuarios));

    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}


export async function POST(req: Request) {

    try {
        const body = await req.json();
        const parsed = CrearUsuarioDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const usuarioCreado = await UsuarioService.crearUsuario(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Usuario creado con éxito", [usuarioCreado]));

    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}
