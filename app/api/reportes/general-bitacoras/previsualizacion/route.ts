import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

type BitacoraConRelaciones = Prisma.BitacoraGetPayload<{
    include: {
        cliente: true;
        usuario: true;
        tipo_servicio: true;
    };
}>;

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas");
        }

        const bitacoras = await BitacoraService.obtenerBitacorasRangoFechas(fechaInicio, fechaFinal);        
        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras en el rango de fechas especificado");
        }

        const bitacoras_filtradas = bitacoras.map((bitacora: BitacoraConRelaciones) => ({
            fecha: bitacora.fecha_servicio ?? bitacora.fecha_servicio,
            ticket: bitacora.no_ticket,
            cliente: bitacora.cliente.empresa,
            hora_llegada: bitacora.hora_llegada,
            hora_salida: bitacora.hora_salida,
            tecnico: bitacora.usuario.nombre,
            horas: bitacora.horas_consumidas,
            servicio: bitacora.tipo_servicio?.descripcion,
            modalidad: bitacora.modalidad,
            tipo_horas: bitacora.tipo_horas,
            descripcion: bitacora.descripcion_servicio
        }));

        return NextResponse.json(new ResponseDto(200, "Bitácoras recuperadas con éxito", [bitacoras_filtradas]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
