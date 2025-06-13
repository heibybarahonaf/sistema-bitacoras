import { NextResponse } from "next/server";
import { BitacoraService } from "../../../services/bitacoraService";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { GeneralUtils } from "../../../common/utils/general.utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacora = await BitacoraService.obtenerBitacoraPorId(id);

        return NextResponse.json(new ResponseDto(200, "Bitacora recuperada con éxito", [bitacora]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
