import { NextResponse } from 'next/server';
import { CrearEncuestaDto } from '@/app/dtos/encuesta.dto';
import { ResponseDto } from '@/app/common/dtos/response.dto';
import { GeneralUtils } from '@/app/common/utils/general.utils';
import { EncuestaService } from '@/app/services/encuestaService';

export async function GET() {

    try {

        const encuestas = await EncuestaService.obtenerEncuestasPreguntas();
        return NextResponse.json(new ResponseDto(200, "Encuestas recuperados con éxito", [encuestas]));

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}

export async function POST(req: Request) {

    try {
        const body = await req.json();
        const parsed = CrearEncuestaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const encuestaCreada = await EncuestaService.crearEncuesta(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Encuesta creada con éxito", [encuestaCreada]));

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
