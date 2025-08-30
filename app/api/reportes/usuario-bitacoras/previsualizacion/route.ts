import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { ConfiguracionService } from "@/app/services/configService";

type Bitacora = {
    id: number;
    fecha_servicio: Date;
    no_ticket: string | null;
    no_factura: string | null;
    cliente_id: number;
    usuario_id: number;
    horas_consumidas: number | null;
    tipo_horas: string | null;
    cliente?: { empresa: string } | null;
    firmaCliente?: { firma_base64: string | null, updatedAt: Date | null} | null;
    usuario?: { 
        nombre: string;
        comision: number | null;
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
        const nombre = searchParams.get('nombre');
        const estado = searchParams.get('estado') as "firmadas" | "pendientes" | null;

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(400, "Se requieren ambas fechas");
        }

        if (nombre === "") {
            throw new ResponseDto(400, "Se requiere el nombre del técnico o 'Todos los técnicos'");
        }

        let bitacoras;
        
        if (nombre === "Todos" || !nombre) {
            bitacoras = await BitacoraService.obtenerTodasBitacorasFechas(fechaInicio, fechaFinal, estado || "firmadas");
        } else {
            bitacoras = await BitacoraService.obtenerBitacorasTecnicoFechas(nombre, fechaInicio, fechaFinal, estado || "firmadas");
        }

        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras para el técnico en el rango de fechas especificado");
        }

        const config = await ConfiguracionService.obtenerConfiguracionPorId(1);
        
        const bitacoras_filtradas = bitacoras.map((bitacora: Bitacora) => {
            
            const horas = bitacora.horas_consumidas ?? 0;
            const comisionPorcentaje = bitacora.usuario?.comision ?? 0;
            
            const esIndividual = bitacora.tipo_horas === 'Individual';
            const precio = esIndividual ? config.valor_hora_individual : config.valor_hora_paquete;
            const monto = horas * precio;
            const comision = monto * (comisionPorcentaje / 100);

            return {
                id: bitacora.id,
                fecha: bitacora.fecha_servicio,
                ticket: bitacora.no_ticket,
                no_factura: bitacora.no_factura == null ? "N/A" : bitacora.no_factura,
                cliente: bitacora.cliente?.empresa ?? `ID: ${bitacora.cliente_id}`,
                tecnico: bitacora.usuario?.nombre ?? `ID: ${bitacora.usuario_id}`,
                usuario: bitacora.usuario?.nombre ?? `ID: ${bitacora.usuario_id}`,
                horas,
                tipo_horas: bitacora.tipo_horas,
                monto: Number(monto.toFixed(2)),
                comision: Number(comision.toFixed(2)),
                porcentaje_comision: comisionPorcentaje,
                firmaCliente: bitacora.firmaCliente?.updatedAt || null,
                firma_base64: bitacora.firmaCliente?.firma_base64 || ""
            };
            
        });


        return NextResponse.json(new ResponseDto(200, "Bitácoras recuperadas con éxito", [bitacoras_filtradas]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
