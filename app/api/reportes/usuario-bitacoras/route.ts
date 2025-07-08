import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { generarPDFPorTecnico } from "@/app/services/reporteService";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');
        const nombre = searchParams.get('nombre');

        if (!fechaInicio || !fechaFinal || !nombre) {
            throw new ResponseDto(400, "Se requieren fechas y el nombre del tecnico");
        }

        const bitacoras = await BitacoraService.obtenerBitacorasTecnicoFechas(nombre, fechaInicio, fechaFinal);
        const buffer = await generarPDFPorTecnico(bitacoras, fechaInicio, fechaFinal);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="usuario_${nombre}_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
