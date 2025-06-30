import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { CrearUsuarioDto } from "@/app/dtos/usuario.dto";
import { UsuarioService } from "@/app/services/usuarioService";

export async function GET() {

    try {

        const usuarios = await UsuarioService.obtenerUsuarios();
        return NextResponse.json(new ResponseDto(200, "Usuarios obtenidos correctamente", usuarios));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

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

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
