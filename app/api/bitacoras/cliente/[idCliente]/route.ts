import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function GET( req: Request, { params }: { params: Promise<{ idCliente: string }> }) {
  
    try {

        const idParams = (await params).idCliente
        const id = GeneralUtils.validarIdParam(idParams);

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const estado = searchParams.get('estado') as 'pendientes' | 'firmadas' | null;

        const response = await BitacoraService.obtenerBitacorasCliente(
            id,
            page,
            limit,
            estado || undefined
        );

        return NextResponse.json(response);

    } catch (error) {

            return GeneralUtils.generarErrorResponse(error);

    }

}
