import { NextResponse } from "next/server";
import { BitacoraService } from "../../../services/bitacoraService";
import { ResponseDto } from "../../../common/dtos/response.dto";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const bitacoras = await BitacoraService.obtenerBitacorasPorCliente(id);

    return NextResponse.json(
      new ResponseDto(200, "Bitácoras del cliente obtenidas", bitacoras)
    );
  } catch (error) {
    return NextResponse.json(
      new ResponseDto(500, "Error al obtener bitácoras", []),
      { status: 500 }
    );
  }
}
