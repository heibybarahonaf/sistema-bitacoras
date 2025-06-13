import { NextResponse } from 'next/server';
import { ResponseDto } from '../../common/dtos/response.dto';
import { EncuestaService } from '../../services/encuestaService';
import { CrearEncuestaDto } from '../../dtos/encuesta.dto';
import { GeneralUtils } from '../../common/utils/general.utils';

export async function GET() {

    try {

        //const encuestas = await EncuestaService.obtenerEncuestas();
        const encuestas = await EncuestaService.obtenerEncuestasPreguntas();
        return NextResponse.json(new ResponseDto(200, "Encuestas recuperados con éxito", [encuestas]));

    } catch (error) {
        
        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
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
        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}
