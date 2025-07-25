import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { SistemaService } from "@/app/services/sistemaService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET() {

    try{

        const sistemas = await SistemaService.obtenerSistemasActivos();
        return NextResponse.json(new ResponseDto(200, "Sistemas activos obtenidos correctamente", sistemas));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
