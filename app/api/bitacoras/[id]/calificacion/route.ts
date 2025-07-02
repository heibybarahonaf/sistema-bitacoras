import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { ActualizarCalificacionDto } from "@/app/dtos/actualizarCalificacion.dto"; 

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {

    try {
      
        const idParams = (await params).id;
        const bitacoraId = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = ActualizarCalificacionDto.safeParse(body);

        if (!parsed.success) {
          throw GeneralUtils.zodValidationError(parsed.error);
        }

        const { calificacion } = parsed.data;
        const resultado = await BitacoraService.actualizarCalificacion(bitacoraId, calificacion);
        return NextResponse.json(new ResponseDto(200, "Calificación actualizada con éxito", [resultado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
