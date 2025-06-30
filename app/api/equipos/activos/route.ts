import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { EquipoService } from "@/app/services/equipoService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET() {

    try{

        const equipos = await EquipoService.obtenerEquiposActivos();
        return NextResponse.json(new ResponseDto(200, "Equipos activos obtenidos correctamente", equipos));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
