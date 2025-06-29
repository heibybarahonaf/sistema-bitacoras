import { NextResponse } from "next/server";
import { ResponseDto } from "../../common/dtos/response.dto";
import { EquipoService } from "../../services/equipoService";
import { GeneralUtils } from "../../common/utils/general.utils";
import { CrearEquipoDto } from "../../dtos/equipo.dto";
import { obtenerPayloadSesion } from "../../common/utils/session.utils";

export async function GET() {

    try{/*
        const payload = await obtenerPayloadSesion();

        //test
        if (payload.rol !== "admin") {
            return NextResponse.json(new ResponseDto(403, "No tienes permiso para acceder a esta información"));
        }*/

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
