import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Sistema } from "@prisma/client";
import { CrearSistemaDto } from "../dtos/sistema.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

const EditarSistemaDto = CrearSistemaDto.partial();
type EditarSistemaDto = z.infer<typeof EditarSistemaDto>;
type CrearSistemaDto = z.infer<typeof CrearSistemaDto>;

interface PaginationResult {
    data: Sistema[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class SistemaService {

    public static async obtenerSistemasPaginados(page: number = 1, limit: number = 10, search: string = ""): Promise<PaginationResult> {
    
        const offset = (page - 1) * limit;
        const whereCondition = search 
            ? {
                OR: [
                    { sistema: { contains: search, mode: 'insensitive' as const } }
                ]
            }
            : {};
    
        const [sistemas, total] = await Promise.all([
            prisma.sistema.findMany({
                where: whereCondition,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.sistema.count({
                where: whereCondition
            })
        ]);
    
        const totalPages = Math.ceil(total / limit);
        if (sistemas.length === 0 && total === 0) {
            throw new ResponseDto(404, "No se encontraron sistemas");
        }
    
        return { data: sistemas, total, page, limit, totalPages };
    
    }


    public static async obtenerSistemasActivos(): Promise<Sistema[]> {

        const sistemas = await prisma.sistema.findMany({ where: { activo: true } });

        if (sistemas.length === 0) {
            throw new ResponseDto(404, "No se encontraron sistemas activos");
        }

        return sistemas;

    }


    public static async obtenerSistemaPorId(id: number): Promise<Sistema> {

        const sistema = await prisma.sistema.findUnique({ where: { id } });

        if (!sistema) {
            throw new ResponseDto(404, "Sistema no encontrado");
        }

        return sistema;

    }


    public static async obtenerSistemaPorNombre(nombre: string): Promise<Sistema> {

        const sistema = await prisma.sistema.findFirst({ where: { sistema: { contains: nombre, mode: "insensitive" } } });

        if (!sistema) {
            throw new ResponseDto(404, "Sistema no encontrado");
        }

        return sistema;

    }


    public static async crearSistema(sistemaData: CrearSistemaDto): Promise<Sistema> {

        const sistemaExistente = await prisma.sistema.findFirst({ where: { sistema: { contains: sistemaData.sistema, mode: "insensitive" } } });

        if (sistemaExistente) {
            throw new ResponseDto(409, "Ya existe un sistema con ese nombre");
        }

        try {
            const sistemaCreado = await prisma.sistema.create({
                data: sistemaData 
            });

            return sistemaCreado;

        } catch {

            throw new ResponseDto(500, "Error al crear el sistema");

        }

    }


    public static async editarSistema(id: number, sistemaData: EditarSistemaDto): Promise<Sistema> {

        const sistemaExistente = await this.obtenerSistemaPorId(id);
        const { sistema } = sistemaData;

        if (sistema && sistema !== sistemaExistente.sistema) {
            const sistemaExiste = await prisma.sistema.findFirst({ where: { sistema: sistema }});

            if (sistemaExiste) {
                throw new ResponseDto(409, "El sistema ya está registrado");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(sistemaData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }
        

        try {
            const sistemaActualizado = await prisma.sistema.update({
                where: { id },
                data: sistemaData
            });

            return sistemaActualizado;

        } catch {

            throw new ResponseDto(500, "Error al actualizar el sistema");

        }

    }


    public static async eliminarSistema(id: number): Promise<Sistema>{

        await this.obtenerSistemaPorId(id);

        try {
            const sistemaEliminado = await prisma.sistema.delete({
                where: { id }
            });

            return sistemaEliminado;

        } catch {

            throw new ResponseDto(500, "Error al eliminar el sistema");

        }

    }

}
