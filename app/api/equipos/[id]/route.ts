import { z } from "zod";
import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { EquipoService } from "@/app/services/equipoService";
import { CrearEquipoDto } from "@/app/dtos/equipo.dto";

const EditarEquipoDto = CrearEquipoDto.partial();
type EditarEquipoDto = z.infer<typeof EditarEquipoDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const equipo = await EquipoService.obtenerEquipoPorId(id);

        return NextResponse.json(new ResponseDto(200, "Equipo recuperado con éxito", [equipo]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarEquipoDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const sistemaActualizado = await EquipoService.editarEquipo(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Equipo actualizado con éxito", [sistemaActualizado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const equipoEliminado = await EquipoService.eliminarEquipo(id);

        return NextResponse.json(new ResponseDto(200, "Equipo eliminado con éxito", [equipoEliminado]));
      
    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
