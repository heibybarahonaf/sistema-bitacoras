import { NextResponse } from "next/server";
import { PagoService } from "@/app/services/pagoService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { generarPDFPorPagosTecnico } from "@/app/services/reporteService";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');
        const nombre = searchParams.get('tecnico');

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas");
        }

        if (nombre === "") {
            throw new ResponseDto(400, "Se requiere el nombre del técnico o 'Todos los técnicos'");
        }

        let pagos, buffer;
        
        if (nombre === "Todos" || !nombre) {
            pagos = await PagoService.obtenerTodosPagosFechas(fechaInicio, fechaFinal);
            buffer = await generarPDFPorPagosTecnico(pagos, fechaInicio, fechaFinal, "Todos");
        } else {
            pagos = await PagoService.obtenerPagosTecnicoFechas(nombre, fechaInicio, fechaFinal);
            buffer = await generarPDFPorPagosTecnico(pagos, fechaInicio, fechaFinal, nombre);
        }

        if (pagos.length === 0) {
            throw new ResponseDto(404, "No se encontraron pagos para el técnico en el rango de fechas especificado");
        }
                
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="pagos_${nombre}_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
