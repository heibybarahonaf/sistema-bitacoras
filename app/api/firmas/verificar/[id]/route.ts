import { NextResponse } from "next/server";
import prisma from "@/app/libs/prisma";

export async function GET( _req: Request, { params }: { params: Promise<{ id: string }> }) {
    const idP = (await params).id;
    const id = Number(idP);

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
