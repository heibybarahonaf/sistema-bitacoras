import { z } from "zod";
import { GeneralUtils } from "../../../common/utils/general.utils";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { NextResponse } from "next/server";
import { SistemaService } from "../../../services/sistemaService";
import { CrearSistemaDto } from "../../../dtos/sistema.dto";

const EditarSistemaDto = CrearSistemaDto.partial();
type EditarSistemaDto = z.infer<typeof EditarSistemaDto>;

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {
        const id = parseInt(idParams);

        if (isNaN(id)) {
            throw new ResponseDto(400, "ID inválido");
        }

        const sistema = await SistemaService.obtenerSistemaPorId(id);
        return NextResponse.json(new ResponseDto(200, "Sistema recuperado con éxito", [sistema]));

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
        const parsed = EditarSistemaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const sistemaActualizado = await SistemaService.editarSistema(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Sistema actualizado con éxito", [sistemaActualizado]));

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

        const sistemaEliminado = await SistemaService.eliminarSistema(id);
        return NextResponse.json(new ResponseDto(200, "Sistema eliminado con éxito", [sistemaEliminado]));
      
    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}
