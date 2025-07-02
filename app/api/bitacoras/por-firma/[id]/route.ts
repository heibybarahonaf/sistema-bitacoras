import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {

    try {

        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);

        const bitacora = await BitacoraService.obtenerBitacoraPorFirmaClienteId(id);
        return NextResponse.json({ result: bitacora });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
