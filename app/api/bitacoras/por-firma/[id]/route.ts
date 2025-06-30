import { NextResponse } from "next/server";
import { BitacoraService } from "@/app/services/bitacoraService";

interface Params {
  id: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Cambiar esta línea para usar buscar por firmaClienteId
    const bitacora = await BitacoraService.obtenerBitacoraPorFirmaClienteId(id);

    return NextResponse.json({ result: bitacora });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "No se encontró la bitácora" },
      { status: 404 }
    );
  }
}
