import { z } from "zod";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { CrearFaseImplementacionDto } from "@/app/dtos/faseImplementacion.dto";
import { FaseImplementacionService } from "@/app/services/faseImplementacionService";

const EditarFaseImplementacionDto = CrearFaseImplementacionDto.partial();
type EditarFaseImplementacionDto = z.infer<typeof EditarFaseImplementacionDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const fase_implementacion = await FaseImplementacionService.obtenerFaseImplementacionPorId(id);

        return NextResponse.json(new ResponseDto(200, "Fase de implementación recuperada con éxito", [fase_implementacion]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarFaseImplementacionDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const faseImplementacionActualizada = await FaseImplementacionService.editarFaseImplementacion(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Fase de implementación actualizada con éxito", [faseImplementacionActualizada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const faseImplementacionEliminada = await FaseImplementacionService.eliminarFaseImplementacion(id);

        return NextResponse.json(new ResponseDto(200, "Fase de implementación eliminada con éxito", [faseImplementacionEliminada]));
      
    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
