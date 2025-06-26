import { NextResponse } from "next/server";
import { GeneralUtils } from "../../../../common/utils/general.utils";
import { FirmaReporteService } from "@/app/services/firmaReporteService";
import { TipoServicioService } from "@/app/services/tipoServicioService";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacora = await BitacoraService.obtenerBitacoraPorId(id);
        const tipo_servicio = await TipoServicioService.obtenerTipoServicioPorId(bitacora.tipo_servicio_id);
        const pdfBuffer = await FirmaReporteService.generarReporteFirma(id, tipo_servicio.descripcion);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="firmas-bitacora-${id}.pdf"`,
                "Content-Length": pdfBuffer.length.toString(),
            },
        });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }
  
}
