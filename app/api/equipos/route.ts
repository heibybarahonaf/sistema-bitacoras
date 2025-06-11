import { NextResponse } from "next/server";
import { ResponseDto } from "../../common/dtos/response.dto";
import { EquipoService } from "../../services/equipoService";
import { GeneralUtils } from "../../common/utils/general.utils";
import { CrearEquipoDto } from "../../dtos/equipo.dto";

export async function GET() {

    try{

        const equipos = await EquipoService.obtenerEquipos();
        return NextResponse.json(new ResponseDto(200, "Equipos obtenidos correctamente", equipos));

    }catch (error) {

        return GeneralUtils.generarErrorResponse(error);

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

        return GeneralUtils.generarErrorResponse(error);

    }

}
