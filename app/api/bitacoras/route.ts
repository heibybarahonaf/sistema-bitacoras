import { NextResponse } from "next/server";
import { CrearBitacoraDto } from "@/app/dtos/bitacora.dto";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function POST(req: Request) {

    try {
        const body = await req.json();
        const parsed = CrearBitacoraDto.safeParse(body);

        if (!parsed.success) {
            throw GeneralUtils.zodValidationError(parsed.error);
        }

        const bitacoraCreada = await BitacoraService.crearBitacora(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Bitacora creada con éxito", [bitacoraCreada]));

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
