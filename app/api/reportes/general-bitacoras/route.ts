import { NextResponse } from "next/server";
import { BitacoraService } from "@/app/services/bitacoraService";
import { generarPDFBitacoras } from "@/app/services/reporteService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');

        if (!fechaInicio || !fechaFinal) {
            return NextResponse.json({ message: "Se requieren ambas fechas" }, { status: 400 });
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
