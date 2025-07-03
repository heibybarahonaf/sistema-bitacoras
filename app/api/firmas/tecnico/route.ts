import { NextResponse } from "next/server";
import { CrearFirmaDto } from "@/app/dtos/firma.dto";
import { FirmaService } from "@/app/services/firmaService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function POST(request: Request) {

    try {

        const body = await request.json();

        const dto = CrearFirmaDto.parse({
            ...body
        });

        const firmaCreada = await FirmaService.crearFirmaPorIdTecnico(dto);
        return NextResponse.json(new ResponseDto(201, "Firma creada con éxito", [firmaCreada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
