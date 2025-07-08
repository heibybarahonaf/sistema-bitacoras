import { NextResponse } from "next/server";
import { CrearSistemaDto } from "@/app/dtos/sistema.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { SistemaService } from "@/app/services/sistemaService";
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
            const sistema = await SistemaService.obtenerSistemaPorNombre(nombre);
            result = {
                data: sistema ? [sistema] : [],
                total: sistema ? 1 : 0,
                page: 1,
                limit: 1,
                totalPages: sistema ? 1 : 0
            };
        } else {
            result = await SistemaService.obtenerSistemasPaginados(page, limit, search);
        }
        
        return NextResponse.json(
            new ResponseDto(200, "Sistemas obtenidos correctamente", result.data, {
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
        const parsed = CrearSistemaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const sistemaCreado = await SistemaService.crearSistema(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Sistema creado con éxito", [sistemaCreado]));

    } catch (error) {

       return GeneralUtils.generarErrorResponse(error);

    }

}
