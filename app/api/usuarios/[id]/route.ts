import { z } from "zod";
import { NextResponse } from "next/server";
import { CrearUsuarioDto } from "@/app/dtos/usuario.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { obtenerPayloadSesion } from "@/app/common/utils/session.utils";

const EditarUsuarioDto = CrearUsuarioDto.omit({ password: true }).partial();
type EditarUsuarioDto = z.infer<typeof EditarUsuarioDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const usuario = await UsuarioService.obtenerUsuarioPorId(id);

        return NextResponse.json(new ResponseDto(200, "Usuario recuperado con éxito", [usuario]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarUsuarioDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const usuarioActualizado = await UsuarioService.editarUsuario(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Usuario actualizado con éxito", [usuarioActualizado]));

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
        const usuarioEliminado = await UsuarioService.eliminarUsuario(id);
        
        return NextResponse.json(new ResponseDto(200, "Usuario eliminado con éxito", [usuarioEliminado]));
      
    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
