import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
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

        if (!firma) {
            throw new ResponseDto(404, "Firma no encontrada");
        }

        return firma;

    }


    public static async obtenerFirmaPorIdTecnico(id: number): Promise<Firma> {

        const firma = await prisma.firma.findFirst({ where: { tecnico_id: id } });

        if (!firma) {
            throw new ResponseDto(404, "Firma no encontrada");
        }

        return firma;

    }


    public static async crearFirmaPorIdTecnico(firmaData: CrearFirmaDto): Promise<Firma> {

        const firma = await prisma.firma.create({
            data: {
                firma_base64: firmaData.firma_base64,
                tecnico_id: firmaData.tecnico_id,
                usada: true,
                token: "",
                url: "", 
            },
        });

        return firma;

    }


    public static async actualizarFirmaPorIdTecnico(tecnico_id: number, firma_base64: string): Promise<Firma> {

        const firma = await this.obtenerFirmaPorIdTecnico(tecnico_id);

        const firmaActualizada = await prisma.firma.update({
            where: { id: firma.id },
            data: { firma_base64 },
        });

        return firmaActualizada;

    }
    

    public static async crearFirmaRemota(): Promise<{ id: number; url: string }> {

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


    public static async verificarFirmaCompletada(id: number) {

        const firma = await prisma.firma.findUnique({ where: { id } });
        return firma?.firma_base64 ? true : false;
      
    }


    public static async obtenerFirmaPorToken(token: string) {

        return await prisma.firma.findFirst({
            where: {
                token,
                usada: false,
            },
        });

    }


    public static async guardarFirmaCliente(token: string, firma_base64: string) {

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
