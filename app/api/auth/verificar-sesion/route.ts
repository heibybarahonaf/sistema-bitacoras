import { NextResponse } from 'next/server';
import { ResponseDto } from '@/app/common/dtos/response.dto';
import { GeneralUtils } from '@/app/common/utils/general.utils';
import { obtenerPayloadSesion } from '@/app/common/utils/session.utils';

export async function GET() {

    try {

        const payload = await obtenerPayloadSesion();
        return NextResponse.json(new ResponseDto(200, "Payload obtenido correctamente", [payload]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}