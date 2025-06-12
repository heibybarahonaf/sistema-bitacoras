import { z } from "zod";
import { NextResponse } from "next/server";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { PagoService } from "../../../services/pagoService";
import { CrearPagoDto } from "../../../dtos/pago.dto";
import { GeneralUtils } from "../../../common/utils/general.utils";

const EditarPagoDto = CrearPagoDto.partial();
type EditarPagoDto = z.infer<typeof EditarPagoDto>;

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        
        const id = GeneralUtils.validarIdParam(idParams);
        const pago = await PagoService.obtenerPagoPorId(id);

        return NextResponse.json(new ResponseDto(200, "Pago recuperado con éxito", [pago]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        
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
