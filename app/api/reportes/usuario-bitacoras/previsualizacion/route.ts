import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { ConfiguracionService } from "@/app/services/configService";

type BitacoraConRelaciones = Prisma.BitacoraGetPayload<{
    comision: string,
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
        const nombre = searchParams.get('nombre');

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas");
        }

        if (!nombre) {
            throw new ResponseDto(400, "Se requiere el nombre del técnico");
        }

        const bitacoras = await BitacoraService.obtenerBitacorasTecnicoFechas(nombre, fechaInicio, fechaFinal);
        
        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras para el técnico en el rango de fechas especificado");
        }

        const config = await ConfiguracionService.obtenerConfiguracionPorId(1);
        const bitacoras_filtradas = bitacoras.map((bitacora: BitacoraConRelaciones) => {
        
            const esIndividual = bitacora.tipo_horas === 'Individual';
            const precio = esIndividual ? config.valor_hora_individual : config.valor_hora_paquete;
            const monto = bitacora.horas_consumidas * precio;
            const comision = monto * (bitacora.usuario.comision / 100);

            return {
                id: bitacora.id,
                fecha: bitacora.fecha_servicio,
                ticket: bitacora.no_ticket,
                cliente: bitacora.cliente.empresa,
                tecnico: bitacora.usuario.nombre,
                horas: bitacora.horas_consumidas,
                tipo_horas: bitacora.tipo_horas,
                monto,
                comision,
                porcentaje_comision: bitacora.usuario.comision
            };
        });

        return NextResponse.json(new ResponseDto(200, "Bitácoras recuperadas con éxito", [bitacoras_filtradas]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
