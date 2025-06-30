import { NextResponse } from 'next/server';
import { ResponseDto } from '@/app/common/dtos/response.dto';
import { PreguntaService } from '@/app/services/preguntaService';
import { CrearPreguntaDto } from '@/app/dtos/pregunta.dto';
import { GeneralUtils } from '@/app/common/utils/general.utils';

export async function GET() {

    try {

        const preguntas = await PreguntaService.obtenerPreguntas();
        return NextResponse.json(new ResponseDto(200, "Preguntas recuperadas con éxito", [preguntas]));

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const parsed = CrearPreguntaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const preguntaCreada = await PreguntaService.crearPregunta(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Pregunta creada con éxito", [preguntaCreada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
