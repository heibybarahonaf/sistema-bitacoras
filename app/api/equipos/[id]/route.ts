import { z } from "zod";
import { GeneralUtils } from "../../../common/utils/general.utils";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { NextResponse } from "next/server";
import { EquipoService } from "../../../services/equipoService";
import { CrearEquipoDto } from "../../../dtos/equipo.dto";

const EditarEquipoDto = CrearEquipoDto.partial();
type EditarEquipoDto = z.infer<typeof EditarEquipoDto>;

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        const id = parseInt(idParams);

        if (isNaN(id)) {
            throw new ResponseDto(400, "ID inválido"); 
        }

        const equipo = await EquipoService.obtenerEquipoPorId(id);
        return NextResponse.json(new ResponseDto(200, "Equipo recuperado con éxito", [equipo]));

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
        const id = parseInt(idParams);

        if (isNaN(id)) {
            throw new ResponseDto(400, "ID inválido"); 
        }

        const body = await req.json();
        const parsed = EditarEquipoDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const sistemaActualizado = await EquipoService.editarEquipo(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Equipo actualizado con éxito", [sistemaActualizado]));

    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        const id = parseInt(idParams);

        if (isNaN(id)) {
            throw new ResponseDto(400, "ID inválido"); 
        }

        const equipoEliminado = await EquipoService.eliminarEquipo(id);
        return NextResponse.json(new ResponseDto(200, "Equipo eliminado con éxito", [equipoEliminado]));
      
    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}
