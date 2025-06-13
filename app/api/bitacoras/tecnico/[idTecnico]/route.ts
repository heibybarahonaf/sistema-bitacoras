import { NextResponse } from "next/server";
import { BitacoraService } from "../../../../services/bitacoraService";
import { ResponseDto } from "../../../../common/dtos/response.dto";
import { GeneralUtils } from "../../../../common/utils/general.utils";

export async function GET(req: Request, { params }: { params: { idTecnico: string } }) {
    const idParams = (await params).idTecnico;

    try {
        
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacoras = await BitacoraService.obtenerBitacorasTecnico(id);

        return NextResponse.json(new ResponseDto(200, "Bitacoras obtenidos correctamente", bitacoras));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
