import { NextResponse } from "next/server";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { EquipoService } from "../../../services/equipoService";
import { GeneralUtils } from "../../../common/utils/general.utils";

export async function GET() {

    try{

        const equipos = await EquipoService.obtenerEquiposActivos();
        return NextResponse.json(new ResponseDto(200, "Equipos activos obtenidos correctamente", equipos));

    }catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
