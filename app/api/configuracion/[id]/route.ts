import { z } from "zod";
import { NextResponse } from 'next/server';
import { CrearConfigDto } from "@/app/dtos/config.dto";
import { ResponseDto } from '@/app/common/dtos/response.dto';
import { GeneralUtils } from '@/app/common/utils/general.utils';
import { ConfiguracionService } from '@/app/services/configService';

const EditarConfigDto = CrearConfigDto.partial();
type EditarConfigDto = z.infer<typeof EditarConfigDto>;

export async function GET() {

    try {

        const configuracion = await ConfiguracionService.obtenerConfiguracionPorId(1);
        return NextResponse.json(new ResponseDto(200, "Configuracion recuperada con éxito", [configuracion]));

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);
    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
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
