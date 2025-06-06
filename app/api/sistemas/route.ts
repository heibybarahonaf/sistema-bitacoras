import { ResponseDto } from "../../common/dtos/response.dto";
import { NextResponse } from "next/server";
import { SistemaService } from "../../services/sistemaService";
import { GeneralUtils } from "../../common/utils/general.utils";
import { CrearSistemaDto } from "../../dtos/sistema.dto";

export async function GET() {

    try{

        const sistemas = await SistemaService.obtenerSistemas();
        return NextResponse.json(new ResponseDto(200, "Sistemas obtenidos correctamente", sistemas));

    }catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));

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

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));

    }

}
