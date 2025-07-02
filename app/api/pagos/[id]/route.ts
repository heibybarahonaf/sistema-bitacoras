import { z } from "zod";
import { NextResponse } from "next/server";
import { CrearPagoDto } from "@/app/dtos/pago.dto";
import { PagoService } from "@/app/services/pagoService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { obtenerPayloadSesion } from "@/app/common/utils/session.utils";

const EditarPagoDto = CrearPagoDto.partial();
type EditarPagoDto = z.infer<typeof EditarPagoDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const pago = await PagoService.obtenerPagoPorId(id);

        return NextResponse.json(new ResponseDto(200, "Pago recuperado con éxito", [pago]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const payload = await obtenerPayloadSesion();
        if (payload.rol !== "admin") {
            return NextResponse.json(new ResponseDto(403, "No tienes permiso para realizar esta acción"), { status: 403 });
        }

        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarPagoDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const pagoActualizado = await PagoService.editarPago(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Pago actualizado con éxito", [pagoActualizado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }


}
