import { NextResponse } from "next/server";
import { BitacoraService } from "../../services/bitacoraService";
import { ResponseDto } from "../../common/dtos/response.dto";
import { CrearBitacoraDto } from "../../dtos/bitacora.dto";
import { GeneralUtils } from "../../common/utils/general.utils";

export async function GET() {

    try {

        const clientes = await BitacoraService.obtenerBitacoras();
        return NextResponse.json(new ResponseDto(200, "Bitacoras obtenidas correctamente", clientes));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CrearBitacoraDto.safeParse(body);

    if (!parsed.success) {
      throw GeneralUtils.zodValidationError(parsed.error); // lanzar error para cortar ejecución
    }

    const bitacoraCreada = await BitacoraService.crearBitacora(parsed.data);

    return NextResponse.json(
      new ResponseDto(201, "Bitacora creada con éxito", [bitacoraCreada])
    );

  } catch (error) {
    return GeneralUtils.generarErrorResponse(error);
  }
}

