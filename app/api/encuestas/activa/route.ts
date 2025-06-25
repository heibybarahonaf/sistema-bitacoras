import { NextResponse } from "next/server";
import { EncuestaService } from "@/app/services/encuestaService";
import { ResponseDto } from "@/app/common/dtos/response.dto";

export async function GET() {
  try {
    const encuestaActiva = await EncuestaService.obtenerEncuestaActiva(); // debe devolver encuesta con preguntas
    return NextResponse.json(new ResponseDto(200, "Encuesta activa recuperada", [encuestaActiva]));
  } catch (error) {
    return NextResponse.json(new ResponseDto(404, "No hay encuesta activa"));
  }
}
