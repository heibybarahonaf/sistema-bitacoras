import { NextResponse } from "next/server";
import { FirmaService } from "@/app/services/firmaService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const firma = await FirmaService.obtenerFirmaPorId(id);

    if (!firma) {
      return NextResponse.json({ error: "Firma no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ results: [firma] });
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
