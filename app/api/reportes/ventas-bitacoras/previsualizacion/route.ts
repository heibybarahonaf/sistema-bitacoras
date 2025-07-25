import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

type Bitacora = {
    id: number;
    fecha_servicio: Date;
    cliente_id: number;
    usuario_id: number;
    ventas: string | null;
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
        const usuario = searchParams.get('usuario');

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas");
        }

        if (!usuario) {
            throw new ResponseDto(400, "Se requiere el nombre del técnico");
        }

        const bitacoras = await BitacoraService.obtenerBitacorasTecnicoVentasFechas(usuario, fechaInicio, fechaFinal);
        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras para el técnico en el rango de fechas especificado");
        }

        const bitacoras_filtradas = bitacoras.map((bitacora: Bitacora) => ({
            id: bitacora.id,
            fecha: bitacora.fecha_servicio,
            cliente: bitacora.cliente?.empresa,
            tecnico: bitacora.usuario?.nombre,
            venta: bitacora.ventas
        }));

        return NextResponse.json(new ResponseDto(200, "Bitácoras recuperadas con éxito", [bitacoras_filtradas]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
