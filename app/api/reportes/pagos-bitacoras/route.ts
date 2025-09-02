import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { PagoService } from "@/app/services/pagoService";

type Pago = {
    no_factura: string | null;
    forma_pago: string | null;
    monto: number | null;
    detalle_pago: string | null;
    createdAt: Date;
    cliente?: { empresa: string } | null;
    usuario?: { 
        nombre: string;
        correo: string | null;
        telefono: string | null;
        zona_asignada: string | null;
    } | null;
};

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

        let pagos;
        
        if (nombre === "Todos" || !nombre) {
            pagos = await PagoService.obtenerTodosPagosFechas(fechaInicio, fechaFinal);
        } else {
            pagos = await PagoService.obtenerPagosTecnicoFechas(nombre, fechaInicio, fechaFinal);
        }

        if (pagos.length === 0) {
            throw new ResponseDto(404, "No se encontraron pagos para el técnico en el rango de fechas especificado");
        }
        
        //logica de reporte
        
        return NextResponse.json(new ResponseDto(200, "Pagos recuperadas con éxito", []));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
