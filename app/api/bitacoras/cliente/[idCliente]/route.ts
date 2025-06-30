import { NextResponse } from "next/server";
import { BitacoraService } from "@/app/services/bitacoraService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(req: Request, { params }: { params: Promise<{ idCliente: string }> }) {
    
    try {
        
        const idParams = (await params).idCliente;
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacoras = await BitacoraService.obtenerBitacorasCliente(id);

        return NextResponse.json(new ResponseDto(200, "Bitacoras obtenidos correctamente", bitacoras));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
