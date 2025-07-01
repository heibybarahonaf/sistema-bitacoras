import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService, EditarBitacoraDto } from "@/app/services/bitacoraService";

export async function PUT(req: Request) {

    try {
        const body = await req.json();
        const parsed = EditarBitacoraDto.safeParse(body);

        if (!parsed.success) {
            throw GeneralUtils.zodValidationError(parsed.error);
        }

        const bitacoraActualizada = await BitacoraService.editarBitacora(parsed.data);
        return NextResponse.json(new ResponseDto(200, "Bitácora actualizada con éxito", [bitacoraActualizada])); 

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
