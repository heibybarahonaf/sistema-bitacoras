import { z } from "zod";
import { NextResponse } from "next/server";
import { CrearSistemaDto } from "@/app/dtos/sistema.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { SistemaService } from "@/app/services/sistemaService";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { obtenerPayloadSesion } from "@/app/common/utils/session.utils";

const EditarSistemaDto = CrearSistemaDto.partial();
type EditarSistemaDto = z.infer<typeof EditarSistemaDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const sistema = await SistemaService.obtenerSistemaPorId(id);

        return NextResponse.json(new ResponseDto(200, "Sistema recuperado con éxito", [sistema]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarSistemaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const sistemaActualizado = await SistemaService.editarSistema(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Sistema actualizado con éxito", [sistemaActualizado]));

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
        const sistemaEliminado = await SistemaService.eliminarSistema(id);
        
        return NextResponse.json(new ResponseDto(200, "Sistema eliminado con éxito", [sistemaEliminado]));
      
    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
