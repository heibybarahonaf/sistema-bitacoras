import { NextResponse } from "next/server";
import { CrearClienteDto } from "@/app/dtos/cliente.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { ClienteService } from "@/app/services/clienteService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(request: Request) {

    try {

        const url = new URL(request.url);
        const rtn = url.searchParams.get("rtn") || "";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const search = url.searchParams.get("search") || "";

        if (page < 1 || limit < 1) {
            return NextResponse.json(
                new ResponseDto(400, "Los parámetros de paginación deben ser mayores a 0")
            );
        }

        let result;
        if (rtn) {
            const cliente = await ClienteService.obtenerClientePorRtn(rtn);
            result = {
                data: cliente ? [cliente] : [],
                total: cliente ? 1 : 0,
                page: 1,
                limit: 1,
                totalPages: cliente ? 1 : 0
            };
        } else {
            result = await ClienteService.obtenerClientesPaginados(page, limit, search);
        }

        return NextResponse.json(
            new ResponseDto(200, "Clientes obtenidos correctamente", result.data, {
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
        const parsed = CrearClienteDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const clienteCreado = await ClienteService.crearCliente(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Cliente creado con éxito", [clienteCreado]));

      } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
