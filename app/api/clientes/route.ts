import { z } from "zod";
import { NextResponse } from "next/server";
import { ClienteService } from "../../services/clienteService";
import { ResponseDto } from "../../common/dtos/response.dto";
import { CrearClienteDto } from "../../dtos/cliente.dto";
import { GeneralUtils } from "../../common/utils/general.utils";

const EditarClienteDto = CrearClienteDto.partial();
type EditarClienteDto = z.infer<typeof EditarClienteDto>;

export async function GET() {

  try {

    const clientes = await ClienteService.obtenerClientes();
    return NextResponse.json(new ResponseDto(200, "Clientes obtenidos correctamente.", clientes));

  } catch (error) {

    if (error instanceof ResponseDto) {
      return NextResponse.json(error, { status: error.code });
    }

    return NextResponse.json(new ResponseDto(500, "Error interno del servidor", []));
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

    if (error instanceof ResponseDto) {
      return NextResponse.json(error, { status: error.code });
    }

    return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
  }

}

