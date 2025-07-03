import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { UsuarioService } from "@/app/services/usuarioService";

export async function POST(req: Request) {

    try {
        
        const usuarioExistente = await UsuarioService.obtenerUsuarioPorCorreo("master@correo.com");

        if (usuarioExistente) {
            return NextResponse.json({ success: false, message: "El usuario master ya existe" });
        }

        const nuevoUsuario = {
            nombre: "Master",
            correo: "master@correo.com",
            password: "1234",
            rol: "admin" as "admin",
            activo: true,
            zona_asignada: "-",
            telefono: "0000-0000"
        };

        const usuarioCreado = await UsuarioService.crearUsuario(nuevoUsuario);
        return NextResponse.json(new ResponseDto(201, "Usuario creado con éxito", [usuarioCreado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
