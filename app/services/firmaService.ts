import { z } from "zod";
import { Firma } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CrearFirmaDto } from "../dtos/firma.dto";
import { ResponseDto } from "../common/dtos/response.dto";

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

        if(!firma){
            throw new ResponseDto(404, "Firma no encontrada");
        }
    
        return firma;
    }
  
}
