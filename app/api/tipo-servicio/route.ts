import { NextResponse } from "next/server";
import { ResponseDto } from "../../common/dtos/response.dto";
import { TipoServicioService } from "../../services/tipoServicioService";
import { GeneralUtils } from "../../common/utils/general.utils";
import { CrearTipoServicioDto } from "../../dtos/tipoServicio.dto";

export async function GET() {

    try{

        const tipos_servicio = await TipoServicioService.obtenerTiposServicio();
        return NextResponse.json(new ResponseDto(200, "Tipos servicio obtenidos correctamente", tipos_servicio));

    }catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function POST(req: Request) {

    try {

        const body = await req.json();
        const parsed = CrearTipoServicioDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const tipoServicioCreado = await TipoServicioService.crearTipoServicio(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Tipo servicio creado con éxito", [tipoServicioCreado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
