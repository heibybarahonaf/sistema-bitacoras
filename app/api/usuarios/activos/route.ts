import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET() {

    try {

        const usuarios = await UsuarioService.obtenerUsuariosActivos();
        return NextResponse.json(new ResponseDto(200, "Usuarios obtenidos correctamente", usuarios)); 

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}