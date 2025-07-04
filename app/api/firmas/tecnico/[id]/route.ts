import { NextResponse } from "next/server";
import { FirmaService } from "@/app/services/firmaService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

    try {

        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const firma = await FirmaService.obtenerFirmaPorIdTecnico(id);

        if (!firma) {
            throw new ResponseDto(404, "No se encontró la firma con el ID proporcionado");
        }

        return NextResponse.json(new ResponseDto(200, "Firma recuperada con éxito", [firma]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}


export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {

    try {

        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await request.json();
        const nuevaFirma = body.firma_base64;

        if (!nuevaFirma) {
            throw new ResponseDto(400, "Se requiere la nueva firma_base64");
        }

        const firmaActualizada = await FirmaService.actualizarFirmaPorIdTecnico(id, nuevaFirma);
        return NextResponse.json(new ResponseDto(200, "Firma actualizada con éxito", [firmaActualizada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
