import { NextResponse } from "next/server";
import { EncuestaService } from "@/app/services/encuestaService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET() {

    try {

        const encuestaActiva = await EncuestaService.obtenerEncuestaActiva();
        return NextResponse.json(new ResponseDto(200, "Encuesta activa recuperada", [encuestaActiva]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
