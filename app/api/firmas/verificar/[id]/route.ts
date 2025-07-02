import prisma from "@/app/libs/prisma";
import { NextResponse } from "next/server";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET( _req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        const idP = (await params).id;
        const id = GeneralUtils.validarIdParam(idP);
        const firma = await prisma.firma.findUnique({
            where: { id },
        });

        const firmada = firma?.firma_base64 && firma.usada;
        return NextResponse.json({ firmada: !!firmada });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
