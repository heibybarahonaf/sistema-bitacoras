import { NextResponse } from "next/server";
import { BitacoraService } from "../../../../services/bitacoraService";
import { ResponseDto } from "../../../../common/dtos/response.dto";
import { GeneralUtils } from "../../../../common/utils/general.utils";

export async function GET(req: Request, { params }: { params: { idCliente: string } }) {
    const idParams = (await params).idCliente;

    try {
        
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacoras = await BitacoraService.obtenerBitacorasCliente(id);

        return NextResponse.json(new ResponseDto(200, "Bitacoras obtenidos correctamente", bitacoras));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
