import { NextResponse } from "next/server";
import { CrearFirmaDto } from "@/app/dtos/firma.dto";
import { FirmaService } from "@/app/services/firmaService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function POST(req: Request) {

    try {
        const body = await req.json();
        const parsed = CrearFirmaDto.safeParse(body);

        if (!parsed.success) {
            throw GeneralUtils.zodValidationError(parsed.error);
        }

        const firmaCreada = await FirmaService.crearFirmaPresencial(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Firma creada con éxito", [firmaCreada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }
  
}
