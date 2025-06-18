import { NextResponse } from "next/server";
import { BitacoraService } from "../../../services/bitacoraService";
import { generarPDFPorCliente } from "../../../services/reporteService";
import { GeneralUtils } from "../../../common/utils/general.utils";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const clienteId = searchParams.get('clienteId');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');

        if (!clienteId || !fechaInicio || !fechaFinal) {
            return NextResponse.json({ message: "Faltan parámetros" }, { status: 400 });
        }

        const bitacoras = await BitacoraService.obtenerBitacorasClienteFechas(
            parseInt(clienteId),
            fechaInicio,
            fechaFinal
        );

        const buffer = generarPDFPorCliente(bitacoras, fechaInicio, fechaFinal);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="bitacoras_cliente_${clienteId}_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
