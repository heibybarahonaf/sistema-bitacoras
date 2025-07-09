import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { FaseImplementacionService } from "@/app/services/faseImplementacionService";

export async function GET() {

    try{

        const fases_implemenacion = await FaseImplementacionService.obtenerFasesImplementacionActivas();
        return NextResponse.json(new ResponseDto(200, "Fases de implementacion activas obtenidas correctamente", fases_implemenacion));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
