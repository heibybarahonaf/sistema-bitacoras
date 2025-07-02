import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacora = await BitacoraService.obtenerBitacorasConFirma(id);

        return NextResponse.json(new ResponseDto(200, "Bitacora recuperada con éxito", [bitacora]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
