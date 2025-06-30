export const runtime = 'nodejs'; 

import { NextRequest, NextResponse } from 'next/server';
import { obtenerPayloadSesion } from '../../../common/utils/session.utils';
import { GeneralUtils } from '../../../common/utils/general.utils';
import { UsuarioService } from '@/app/services/usuarioService';
import { ResponseDto } from '@/app/common/dtos/response.dto';

export async function GET(req: NextRequest) {

    try {

        const payload = await obtenerPayloadSesion();
        const usuario = await UsuarioService.obtenerUsuarioPorCorreo(payload.correo);

        return NextResponse.json(new ResponseDto(200, "Sesion obtenida correctamente", [usuario.nombre]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}