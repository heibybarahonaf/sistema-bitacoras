import prisma from "@/app/libs/prisma";
import { NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid"; //
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  
    try {
        const tokenI = (await params).token;

        // Buscar la firma por token, sin importar si fue usada o no
        const firma = await prisma.firma.findFirst({
            where: {
                token: tokenI,
            },
        });

        if (!firma) {
            return NextResponse.json(
                { firmada: false, vencida: true, message: "Firma no encontrada" },
                { status: 404 }
            );
        }

        // Lógica de expiración por tiempo
        // const creada = new Date(firma.createdAt);
        // const ahora = new Date();
        // const minutosPasados = (ahora.getTime() - creada.getTime()) / 60000;

        // if (minutosPasados > 120) {
        //   // Marcar la firma como usada (vencida)
        //   await prisma.firma.update({
        //     where: { id: firma.id },
        //     data: { usada: true },
        //   });
        //   // Crear nueva firma con token y url
        //   const nuevoToken = uuidv4();
        //   const nuevaUrl = `${process.env.NEXT_PUBLIC_URL}/firmar/${nuevoToken}`;

        //   const nuevaFirma = await prisma.firma.create({
        //     data: {
        //       token: nuevoToken,
        //       usada: false,
        //       url: nuevaUrl,
        //     },
        //   });

        //   return NextResponse.json({
        //     firmada: false,
        //     vencida: true,
        //     regenerado: true,
        //     nuevaFirmaId: nuevaFirma.id,
        //     nuevaUrl,
        //     message: "El enlace anterior ha expirado. Se ha generado uno nuevo.",
        //   });
        // }

        // Si ya fue usada, notificarlo
        if (firma.usada) {
            return NextResponse.json({
                firmada: true,
                usada: true,
                vencida: false,
                message: "El enlace ya fue usado",
            });
        }

        // Si es válida y no usada
        return NextResponse.json({
            results: [firma],
            firmada: false,
            usada: false,
            vencida: false,
            message: "Firma válida",
        });

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
