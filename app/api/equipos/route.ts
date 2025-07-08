import { NextResponse } from "next/server";
import { CrearEquipoDto } from "@/app/dtos/equipo.dto";
import { EquipoService } from "@/app/services/equipoService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
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
            const equipo = await EquipoService.obtenerEquipoPorNombre(nombre);
            result = {
                data: equipo ? [equipo] : [],
                total: equipo ? 1 : 0,
                page: 1,
                limit: 1,
                totalPages: equipo ? 1 : 0
            };
        } else {
            result = await EquipoService.obtenerEquiposPaginados(page, limit, search);
        }
        
        return NextResponse.json(
            new ResponseDto(200, "Equipos obtenidos correctamente", result.data, {
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
        const parsed = CrearEquipoDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const equipoCreado = await EquipoService.crearEquipo(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Equipo creado con éxito", [equipoCreado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
