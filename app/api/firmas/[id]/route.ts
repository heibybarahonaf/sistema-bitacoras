import { NextResponse } from "next/server";
import { FirmaService } from "@/app/services/firmaService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const firma = await FirmaService.obtenerFirmaPorId(id);

        if (!firma) {
            throw new ResponseDto(404, "No se encontró la firma con el ID proporcionado");
        }

        return NextResponse.json(new ResponseDto(200, "Firma recuperada con éxito", [firma]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
