import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { TipoServicioService } from "@/app/services/tipoServicioService";
import { FirmaReporteService } from "@/app/services/firmaReporteService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
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
