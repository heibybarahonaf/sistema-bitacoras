import { z } from "zod";
import { Firma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CrearFirmaDto } from "../dtos/firma.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { v4 as uuidv4 } from "uuid";

type CrearFirmaDto = z.infer<typeof CrearFirmaDto>;

export class FirmaService {

  public static async crearFirmaPresencial(firmaData: CrearFirmaDto): Promise<Firma> {
    const firma = await prisma.firma.create({
      data: {
        firma_base64: firmaData.firma_base64,
        usada: true,
        token: "",
        url: "", 
      },
    });

    return firma;
  }

  public static async obtenerFirmaPorId(id: number): Promise<Firma> {
    const firma = await prisma.firma.findUnique({ where: { id } });

    if (!firma) {
      throw new ResponseDto(404, "Firma no encontrada");
    }

    return firma;
  }

  static async crearFirmaRemota(): Promise<{ id: number; url: string }> {
    const token = uuidv4();
    const firma = await prisma.firma.create({
      data: {
        firma_base64: null,
        usada: false,
        token,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/firmar/${token}`,
      },
    });
    return { id: firma.id, url: firma.url };
  }

  static async verificarFirmaCompletada(id: number) {
    const firma = await prisma.firma.findUnique({ where: { id } });
    return firma?.firma_base64 ? true : false;
  }

  static async obtenerFirmaPorToken(token: string) {
    return await prisma.firma.findFirst({
      where: {
        token,
        usada: false,
      },
    });
  }

  static async guardarFirmaCliente(token: string, firma_base64: string) {
    return await prisma.firma.updateMany({
      where: {
        token,
        usada: false,
      },
      data: {
        firma_base64,
        usada: true,
        updatedAt: new Date(),
      },
    });
  }

}

