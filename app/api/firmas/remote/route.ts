import { v4 as uuidv4 } from "uuid";
import prisma from "@/app/libs/prisma";
import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function POST() {

    try {
        const token = uuidv4();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const url = `${baseUrl}/firma/${token}`;

        const firma = await prisma.firma.create({
            data: {
              token,
              url,
              usada: false,
              firma_base64: "",
            },
        });

        return NextResponse.json(new ResponseDto(201, "Firma remota generada", [firma]));
        
    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
      
    }

}
