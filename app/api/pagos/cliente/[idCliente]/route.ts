import { NextResponse } from "next/server";
import { PagoService } from "@/app/services/pagoService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(req: Request, { params }: { params: Promise<{ idCliente: string }> }) {
    
    try {
        
        const idParams = (await params).idCliente;
        const id = GeneralUtils.validarIdParam(idParams);
        const pagosCliente = await PagoService.obtenerPagosPorCliente(id);

        return NextResponse.json(new ResponseDto(200, "Pagos del cliente recuperados con éxito", [pagosCliente]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }
    
}
