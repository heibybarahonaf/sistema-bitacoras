import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { SistemaService } from "@/app/services/sistemaService";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { CrearSistemaDto } from "@/app/dtos/sistema.dto";

export async function GET() {

    try{

        const sistemas = await SistemaService.obtenerSistemas();
        return NextResponse.json(new ResponseDto(200, "Sistemas obtenidos correctamente", sistemas));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function POST(req: Request) {

    try {

        const body = await req.json();
        const parsed = CrearSistemaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const sistemaCreado = await SistemaService.crearSistema(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Sistema creado con éxito", [sistemaCreado]));

    } catch (error) {

       return GeneralUtils.generarErrorResponse(error);

    }

}
