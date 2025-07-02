import { z } from "zod";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { CrearTipoServicioDto } from "@/app/dtos/tipoServicio.dto";
import { obtenerPayloadSesion } from "@/app/common/utils/session.utils";
import { TipoServicioService } from "@/app/services/tipoServicioService";

const EditarTipoServicioDto = CrearTipoServicioDto.partial();
type EditarTipoServicioDto = z.infer<typeof EditarTipoServicioDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const tipo_servicio = await TipoServicioService.obtenerTipoServicioPorId(id);

        return NextResponse.json(new ResponseDto(200, "Tipo servicio recuperado con éxito", [tipo_servicio]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarTipoServicioDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const tipoServicioActualizado = await TipoServicioService.editarTipoServicio(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Tipo servicio actualizado con éxito", [tipoServicioActualizado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const payload = await obtenerPayloadSesion();
        if (payload.rol !== "admin") {
            return NextResponse.json(new ResponseDto(403, "No tienes permiso para realizar esta acción"));
        }

        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const tipoServicioEliminado = await TipoServicioService.eliminarTipoServicio(id);

        return NextResponse.json(new ResponseDto(200, "Tipo servicio eliminado con éxito", [tipoServicioEliminado]));
      
    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
