import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function GET(req: Request, { params }: { params: Promise<{ idTecnico: string }> }) {
    
    try {
        
        const idParams = (await params).idTecnico;
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacoras = await BitacoraService.obtenerBitacorasTecnico(id);

        return NextResponse.json(new ResponseDto(200, "Bitacoras obtenidos correctamente", bitacoras));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
