import { z } from "zod";
import { NextResponse } from "next/server";
import { CrearPreguntaDto } from "@/app/dtos/pregunta.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { PreguntaService } from "@/app/services/preguntaService";

const EditarPreguntaDto = CrearPreguntaDto;
type EditarPreguntaDto = z.infer<typeof CrearPreguntaDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const pregunta = await PreguntaService.obtenerPreguntaPorId(id);

        return NextResponse.json(new ResponseDto(200, "Pregunta recuperada con éxito", [pregunta]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarPreguntaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const preguntaActualizada = await PreguntaService.editarPregunta(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Pregunta actualizada con éxito", [preguntaActualizada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }


}
