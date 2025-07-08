import { z } from "zod";
import { Equipo } from "@prisma/client";
import { prisma } from "../libs/prisma";
import { CrearEquipoDto } from "../dtos/equipo.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

const EditarEquipoDto = CrearEquipoDto.partial();
type EditarEquipoDto = z.infer<typeof EditarEquipoDto>;
type CrearEquipoDto = z.infer<typeof CrearEquipoDto>;

interface PaginationResult {
    data: Equipo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class EquipoService {

    public static async obtenerEquiposPaginados(page: number = 1, limit: number = 10, search: string = ""): Promise<PaginationResult> {
    
        const offset = (page - 1) * limit;
        const whereCondition = search 
            ? {
                OR: [
                    { equipo: { contains: search, mode: 'insensitive' as const } }
                ]
            }
            : {};
    
        const [equipos, total] = await Promise.all([
            prisma.equipo.findMany({
                where: whereCondition,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.equipo.count({
                where: whereCondition
            })
        ]);
    
        const totalPages = Math.ceil(total / limit);
        if (equipos.length === 0 && total === 0) {
            throw new ResponseDto(404, "No se encontraron equipos");
        }
    
        return { data: equipos, total, page, limit, totalPages };
    
    }
    

    public static async obtenerEquiposActivos(): Promise<Equipo[]> {

        const equipos = await prisma.equipo.findMany({ where: { activo: true }});

        if (equipos.length === 0) {
            throw new ResponseDto(404, "No se encontraron equipos activos");
        }

        return equipos;

    }


    public static async obtenerEquipoPorId(id: number): Promise<Equipo> {

        const equipo = await prisma.equipo.findUnique({ where: { id } });

        if (!equipo) {
            throw new ResponseDto(404, "Equipo no encontrado");
        }

        return equipo;

    }


    public static async obtenerEquipoPorNombre(nombre: string): Promise<Equipo> {

        const equipo = await prisma.equipo.findFirst({ where: { equipo: { contains: nombre, mode: "insensitive" } } });

        if (!equipo) {
            throw new ResponseDto(404, "Equipo no encontrado");
        }

        return equipo;

    }


    public static async crearEquipo(equipoData: CrearEquipoDto): Promise<Equipo> {

        const equipoExistente = await prisma.equipo.findFirst({ where: { equipo: { contains: equipoData.equipo, mode: "insensitive" } } });

        if (equipoExistente) {
            throw new ResponseDto(409, "Ya existe un equipo con ese nombre");
        }

        try {
            const equipoCreado = await prisma.equipo.create({
                data: equipoData 
            });

            return equipoCreado;

        } catch {

            throw new ResponseDto(500, "Error al crear el equipo");

        }

    }


    public static async editarEquipo(id: number, equipoData: EditarEquipoDto): Promise<Equipo> {

        const equipoExistente = await this.obtenerEquipoPorId(id);
        const { equipo } = equipoData;

        if (equipo && equipo !== equipoExistente.equipo) {
            const equipoExistente = await prisma.equipo.findFirst({ where: { equipo: equipo }});

            if (equipoExistente) {
                throw new ResponseDto(409, "El equio ya está registrado");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(equipoData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }
        

        try {
            const equipoActualizado = await prisma.equipo.update({
                where: { id },
                data: equipoData
            });

            return equipoActualizado;

        } catch {

            throw new ResponseDto(500, "Error al actualizar el equipo");

        }

    }


    public static async eliminarEquipo(id: number): Promise<Equipo>{

        await this.obtenerEquipoPorId(id);

        try {
            const equipoEliminado = await prisma.equipo.delete({
                where: { id }
            });

            return equipoEliminado;

        } catch {

            throw new ResponseDto(500, "Error al eliminar el equipo");

        }

    }

}
