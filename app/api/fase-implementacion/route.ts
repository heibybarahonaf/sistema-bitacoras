import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { CrearFaseImplementacionDto } from "@/app/dtos/faseImplementacion.dto";
import { FaseImplementacionService } from "@/app/services/faseImplementacionService";

export async function GET() {

    try{

        const fases_implementacion = await FaseImplementacionService.obtenerFasesImplementacion();
        return NextResponse.json(new ResponseDto(200, "Fases de implementación obtenidas correctamente", fases_implementacion));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function POST(req: Request) {

    try {

        const body = await req.json();
        const parsed = CrearFaseImplementacionDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const faseImplementacionCreada = await FaseImplementacionService.crearFaseImplementacion(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Fase de implementación creada con éxito", [faseImplementacionCreada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
