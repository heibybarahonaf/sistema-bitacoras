import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { TipoServicioService } from "@/app/services/tipoServicioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET() {

    try{

        const tipo_servicio = await TipoServicioService.obtenerTiposServicioActivos();
        return NextResponse.json(new ResponseDto(200, "Tipo de servicios activos obtenidos correctamente", tipo_servicio));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
