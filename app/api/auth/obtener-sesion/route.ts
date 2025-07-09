import { NextResponse } from 'next/server';
import { ResponseDto } from '@/app/common/dtos/response.dto';
import { UsuarioService } from '@/app/services/usuarioService';
import { GeneralUtils } from '@/app/common/utils/general.utils';
import { obtenerPayloadSesion } from '@/app/common/utils/session.utils';

export async function GET() {

    try {

        const payload = await obtenerPayloadSesion();
        const usuario = await UsuarioService.obtenerUsuarioPorCorreo(payload.correo);

        return NextResponse.json(new ResponseDto(200, "Sesion obtenida correctamente", [usuario]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}