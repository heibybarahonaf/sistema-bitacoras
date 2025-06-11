import { NextResponse } from "next/server";
import { ResponseDto } from "../../../../common/dtos/response.dto";
import { PagoService } from "../../../../services/pagoService";
import { GeneralUtils } from "../../../../common/utils/general.utils";

export async function GET(req: Request, { params }: { params: { idCliente: string } }) {
    const idParams = (await params).idCliente;

    try {

        const id = GeneralUtils.validarIdParam(idParams);
        const pagosCliente = await PagoService.obtenerPagosPorCliente(id);

        return NextResponse.json(new ResponseDto(200, "Pagos del cliente recuperados con éxito", [pagosCliente]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }
    
}
