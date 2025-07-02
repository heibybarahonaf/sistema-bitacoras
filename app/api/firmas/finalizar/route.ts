import { z } from "zod";
import prisma from "@/app/libs/prisma";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

const FinalizarFirmaDto = z.object({
    id: z.number(),
    firma_base64: z.string(),
});

export async function POST(req: Request) {
  
    try {
        const body = await req.json();
        const parsed = FinalizarFirmaDto.safeParse(body);

        if (!parsed.success) {
            throw new ResponseDto(404, "Datos inválidos");
        }

        const firma = await prisma.firma.update({
            where: { id: parsed.data.id },
            data: {
                firma_base64: parsed.data.firma_base64,
                usada: true,
            },
        });

        return NextResponse.json(new ResponseDto(200, "Firma completada", [firma]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
