import { NextResponse } from "next/server";
import { BitacoraService } from "../../../services/bitacoraService";
import { generarPDFPorCliente } from "../../../services/reporteService";
import { GeneralUtils } from "../../../common/utils/general.utils";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const rtn = searchParams.get('RTN');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');

        if (!rtn || !fechaInicio || !fechaFinal) {
           return NextResponse.json({ message: "Se requieren ambas fechas y el rtn del cliente" }, { status: 400 });
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
