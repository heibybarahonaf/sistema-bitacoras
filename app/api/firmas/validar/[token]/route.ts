import { NextResponse } from "next/server";
import prisma from "@/app/libs/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const firma = await prisma.firma.findFirst({
      where: {
        token: params.token,
        usada: false,
      },
    });

    if (!firma) {
      return NextResponse.json(
        { firmada: false, vencida: true, message: "Firma no encontrada o ya fue usada" },
        { status: 404 }
      );
    }

    const creada = new Date(firma.createdAt);
    const ahora = new Date();
    const minutosPasados = (ahora.getTime() - creada.getTime()) / 60000;

    if (minutosPasados > 1) {
      // Marcar la firma como usada (vencida)
      await prisma.firma.update({
        where: { id: firma.id },
        data: { usada: true },
      });

      // Crear nueva firma con token y url
      const nuevoToken = uuidv4();
      const nuevaUrl = `${process.env.NEXT_PUBLIC_URL}/firmar/${nuevoToken}`;

      const nuevaFirma = await prisma.firma.create({
        data: {
          token: nuevoToken,
          usada: false,
          url: nuevaUrl,
        },
      });

      return NextResponse.json({
        firmada: false,
        vencida: true,
        regenerado: true,
        nuevaFirmaId: nuevaFirma.id,
        nuevaUrl,
        message: "El enlace anterior ha expirado. Se ha generado uno nuevo.",
      });
    }

    return NextResponse.json({ firmada: firma.usada, vencida: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al validar firma" }, { status: 500 });
  }
}

