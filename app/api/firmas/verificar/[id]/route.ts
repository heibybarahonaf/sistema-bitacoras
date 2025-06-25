import { NextResponse } from "next/server";
import prisma from "@/app/libs/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const firma = await prisma.firma.findUnique({
      where: { id },
    });

    const firmada = firma?.firma_base64 && firma.usada;
    return NextResponse.json({ firmada: !!firmada });
  } catch (error) {
    console.error("Error verificando firma:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
