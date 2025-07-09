import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { generarPDFBitacoras } from "@/app/services/reporteService";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas");
        }

        const bitacoras = await BitacoraService.obtenerBitacorasRangoFechas(fechaInicio, fechaFinal);
        const buffer = generarPDFBitacoras(bitacoras, fechaInicio, fechaFinal);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="bitacoras_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }
    
}
