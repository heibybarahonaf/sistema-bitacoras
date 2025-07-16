import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const usuario = await UsuarioService.obtenerNombreUsuarioPorId(id);

        return NextResponse.json(new ResponseDto(200, "Usuario recuperado con éxito", [usuario]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
