import { z } from "zod";
import { NextResponse } from 'next/server';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { ConfiguracionService } from '../../../services/configService';
import { GeneralUtils } from '@/app/common/utils/general.utils';
import { CrearConfigDto } from "../../../dtos/config.dto";

const EditarConfigDto = CrearConfigDto.partial();
type EditarConfigDto = z.infer<typeof EditarConfigDto>;

export async function GET() {

    try {

        const configuracion = await ConfiguracionService.obtenerConfiguracionPorId(1);
        return NextResponse.json(new ResponseDto(200, "Configuracion recuperada con éxito", [configuracion]));

    } catch (error) {
        
        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {

        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarConfigDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const configuracionActualizada = await ConfiguracionService.editarConfiguracion(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Configuracion actualizada con éxito", [configuracionActualizada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
