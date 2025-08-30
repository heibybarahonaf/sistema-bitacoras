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
        const estado = searchParams.get('estado') as "firmadas" | "pendientes" | null;

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren fechas de inicio y final");
        }

        if (nombre === "") {
            throw new ResponseDto(400, "Se requiere el nombre del técnico o 'Todos los técnicos'");
        }
        
        let bitacoras;
        let buffer;
                
        if (nombre === "Todos" || !nombre) {
            bitacoras = await BitacoraService.obtenerTodasBitacorasFechas(fechaInicio, fechaFinal, estado || "firmadas");
            buffer = await generarPDFPorTecnico(bitacoras, fechaInicio, fechaFinal, "Todos");
        } else {
            bitacoras = await BitacoraService.obtenerBitacorasTecnicoFechas(nombre, fechaInicio, fechaFinal, estado || "firmadas");
            buffer = await generarPDFPorTecnico(bitacoras, fechaInicio, fechaFinal, nombre);
        }

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
