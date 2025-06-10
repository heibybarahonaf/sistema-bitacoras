import { ResponseDto } from "../../common/dtos/response.dto";
import { NextResponse } from "next/server";
import { EquipoService } from "../../services/equipoService";
import { GeneralUtils } from "../../common/utils/general.utils";
import { CrearEquipoDto } from "../../dtos/equipo.dto";

export async function GET() {

    try{

        const equipos = await EquipoService.obtenerEquipos();
        return NextResponse.json(new ResponseDto(200, "Equipos obtenidos correctamente", equipos));

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
        const parsed = CrearEquipoDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const equipoCreado = await EquipoService.crearEquipo(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Equipo creado con éxito", [equipoCreado]));

    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));

    }

}
