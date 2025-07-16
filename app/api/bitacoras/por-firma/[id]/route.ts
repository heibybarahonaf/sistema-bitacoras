import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {

    try {

        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);

        const bitacora = await BitacoraService.obtenerBitacoraPorFirmaClienteId(id);
        return NextResponse.json({ 
            result: { 
                id: bitacora.id,
                no_ticket: bitacora.no_ticket, 
                fecha_servicio: bitacora.fecha_servicio, 
                tecnico_ref: bitacora.usuario_id, 
                descripcion_servicio: bitacora.descripcion_servicio, 
                modalidad: bitacora.modalidad, 
                horas_consumidas: bitacora.horas_consumidas
            } 
        });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
