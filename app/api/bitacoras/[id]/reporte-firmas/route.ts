import { NextResponse } from "next/server";
import { GeneralUtils } from "../../../../common/utils/general.utils";
import { FirmaReporteService } from "@/app/services/firmaReporteService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        
        const id = GeneralUtils.validarIdParam(idParams);
        const pdfBuffer = await FirmaReporteService.generarReporteFirma(id);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="firmas-bitacora-${id}.pdf"`,
                "Content-Length": pdfBuffer.length.toString(),
            },
        });

    } catch (error) {

        console.error("Error generating report:", error);
        return GeneralUtils.generarErrorResponse(error);
        
    }
  
}
