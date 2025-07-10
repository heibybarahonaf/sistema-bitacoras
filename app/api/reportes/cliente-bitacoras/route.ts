import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { generarPDFPorCliente } from "@/app/services/reporteService";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const rtn = searchParams.get('RTN');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');

        if (!rtn || !fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas y el rtn del cliente");
        }

        const bitacoras = await BitacoraService.obtenerBitacorasClienteFechas(
            rtn,
            fechaInicio,
            fechaFinal
        );

        const buffer = generarPDFPorCliente(bitacoras, fechaInicio, fechaFinal);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="bitacoras_cliente_${rtn}_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
