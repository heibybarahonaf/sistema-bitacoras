import { z } from "zod";
import { NextResponse } from "next/server";
import { UsuarioService } from "../../../services/usuarioService";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { CrearUsuarioDto } from "../../../dtos/usuario.dto";
import { GeneralUtils } from "../../../common/utils/general.utils";

const EditarUsuarioDto = CrearUsuarioDto.omit({ password: true }).partial();
type EditarUsuarioDto = z.infer<typeof EditarUsuarioDto>;

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;
  
    try {
        const id = parseInt(idParams);

        if (isNaN(id)) {
            throw new ResponseDto(400, "ID inválido"); 
        }

        const usuario = await UsuarioService.obtenerUsuarioPorId(id);
        return NextResponse.json(new ResponseDto(200, "Usuario recuperado con éxito", [usuario]));

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
        const parsed = EditarUsuarioDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const usuarioActualizado = await UsuarioService.editarUsuario(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Usuario actualizado con éxito", [usuarioActualizado]));

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

        const usuarioEliminado = await UsuarioService.eliminarUsuario(id);
        return NextResponse.json(new ResponseDto(200, "Usuario eliminado con éxito", [usuarioEliminado]));
      
    } catch (error) {

        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }

}
