import { NextResponse } from "next/server";
import { BitacoraService } from "@/app/services/bitacoraService";
import { ActualizarCalificacionDto } from "@/app/dtos/actualizarCalificacion.dto"; 
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { ResponseDto } from "@/app/common/dtos/response.dto";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = ActualizarCalificacionDto.safeParse(body);

    if (!parsed.success) {
      throw GeneralUtils.zodValidationError(parsed.error);
    }

    const bitacoraId = Number(params.id);
    const { calificacion } = parsed.data;

    const resultado = await BitacoraService.actualizarCalificacion(bitacoraId, calificacion);

    return NextResponse.json(new ResponseDto(200, "Calificación actualizada con éxito", [resultado]));

  } catch (error) {
    return GeneralUtils.generarErrorResponse(error);
  }
}
