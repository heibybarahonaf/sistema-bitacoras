import { NextResponse } from "next/server";
import { BitacoraService } from "../../../services/bitacoraService";
import { generarPDFPorTecnico } from "../../../services/reporteService";
import { GeneralUtils } from "../../../common/utils/general.utils";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');
        const usuarioId = searchParams.get('usuarioId');

        if (!fechaInicio || !fechaFinal || !usuarioId) {
            return NextResponse.json({ message: "Se requieren fechas y usuarioId" }, { status: 400 });
        }

        const bitacoras = await BitacoraService.obtenerBitacorasTecnicoFechas(parseInt(usuarioId), fechaInicio, fechaFinal);
        const buffer = await generarPDFPorTecnico(bitacoras, fechaInicio, fechaFinal);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="usuario_${usuarioId}_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
