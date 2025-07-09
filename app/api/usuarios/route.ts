import { NextResponse } from "next/server";
import { CrearUsuarioDto } from "@/app/dtos/usuario.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { UsuarioService } from "@/app/services/usuarioService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(request: Request) {

    try{

        const url = new URL(request.url);
        const nombre = url.searchParams.get("nombre") || "";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const search = url.searchParams.get("search") || "";

        if (page < 1 || limit < 1) {
            return NextResponse.json(
                new ResponseDto(400, "Los parámetros de paginación deben ser mayores a 0")
            );
        }

        let result;
        if (nombre) {
            const usuario = await UsuarioService.obtenerUsuarioPorNombre(nombre);
            result = {
                data: usuario ? [usuario] : [],
                total: usuario ? 1 : 0,
                page: 1,
                limit: 1,
                totalPages: usuario ? 1 : 0
            };
        } else {
            result = await UsuarioService.obtenerUsuariosPaginados(page, limit, search);
        }
        
        return NextResponse.json(
            new ResponseDto(200, "usuarios obtenidos correctamente", result.data, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            })
        );

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function POST(req: Request) {

    try {
        
        const body = await req.json();
        const parsed = CrearUsuarioDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const usuarioCreado = await UsuarioService.crearUsuario(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Usuario creado con éxito", [usuarioCreado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
