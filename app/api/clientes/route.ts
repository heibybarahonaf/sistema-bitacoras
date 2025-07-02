import { NextResponse } from "next/server";
import { CrearClienteDto } from "@/app/dtos/cliente.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { ClienteService } from "@/app/services/clienteService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(request: Request) {

    try {

        const url = new URL(request.url);
        const rtn = url.searchParams.get("rtn") || "";

        let clientes;
        if (rtn) {
            const cliente = await ClienteService.obtenerClientePorRtn(rtn);
            clientes = cliente ? [cliente] : [];
        } else {
            clientes = await ClienteService.obtenerClientes();
        }

        return NextResponse.json(new ResponseDto(200, "Clientes obtenidos correctamente", clientes));

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
