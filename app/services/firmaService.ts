import prisma from "../libs/prisma";
import { CrearFirmaDto } from "../dtos/firma.dto";
import { z } from "zod";

export class FirmaService {
  static async crearFirmaPresencial(data: z.infer<typeof CrearFirmaDto>) {
    const firma = await prisma.firma.create({
      data: {
        firma_base64: data.firma_base64,
        usada: true,
        token: "", // no se necesita en presencial
        url: "",   // no se necesita en presencial
      },
    });

    return firma;
  }
}
