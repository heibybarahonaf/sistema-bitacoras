import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Fase_Implementacion } from "@prisma/client";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";
import { CrearFaseImplementacionDto } from "../dtos/faseImplementacion.dto";

const EditarFaseImplementacionDto = CrearFaseImplementacionDto.partial();
type EditarFaseImplementacionDto = z.infer<typeof EditarFaseImplementacionDto>;
type CrearFaseImplementacionDto = z.infer<typeof CrearFaseImplementacionDto>;

export class FaseImplementacionService {

    public static async obtenerFasesImplementacion(): Promise<Fase_Implementacion[]> {
        
        const fase_implementacion = await prisma.fase_Implementacion.findMany({});

        if (fase_implementacion.length === 0) {
            throw new ResponseDto(404, "No se encontraron fases de implementación");
        }

        return fase_implementacion;

    }
    

    public static async obtenerFasesImplementacionActivas(): Promise<Fase_Implementacion[]> {

        const fase_implementacion = await prisma.fase_Implementacion.findMany({ where: { activa: true }});

        if (fase_implementacion.length === 0) {
            throw new ResponseDto(404, "No se encontraron fases de implementacion activas");
        }

        return fase_implementacion;

    }


    public static async obtenerFaseImplementacionPorId(id: number): Promise<Fase_Implementacion> {

        const fase_implementacion = await prisma.fase_Implementacion.findUnique({ where: { id } });

        if (!fase_implementacion) {
            throw new ResponseDto(404, "Fase de implementacion no encontrada");
        }

        return fase_implementacion;

    }


    public static async crearFaseImplementacion(faseData: CrearFaseImplementacionDto): Promise<Fase_Implementacion> {
        
        const fase_implementacion = await prisma.fase_Implementacion.findFirst({ where: { fase: { contains: faseData.fase, mode: "insensitive" } } });

        if (fase_implementacion) {
            throw new ResponseDto(409, "Ya existe una fase de implementacion con ese nombre");
        }

        try {
            const faseCreada = await prisma.fase_Implementacion.create({
                data: {
                    ...faseData
                }
            });

            return faseCreada;

        } catch {

            throw new ResponseDto(500, "Error al crear la fase de implementacion");

        }

    }


    public static async editarFaseImplementacion(id: number, faseData: EditarFaseImplementacionDto): Promise<Fase_Implementacion> {
        
        const faseExistente = await this.obtenerFaseImplementacionPorId(id);
        const { fase } = faseData;

        if (fase && fase !== faseExistente.fase) {
            const faseExistente = await prisma.fase_Implementacion.findFirst({ where: { fase: fase }});

            if (faseExistente) {
                throw new ResponseDto(409, "La fase de implementación ya está registrado");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(faseData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }
        

        try {
            const faseActualizada = await prisma.fase_Implementacion.update({
                where: { id },
                data: faseData
            });

            return faseActualizada;

        } catch {

            throw new ResponseDto(500, "Error al actualizar la fase de implementacion");

        }

    }


    public static async eliminarFaseImplementacion(id: number): Promise<Fase_Implementacion>{

        await this.obtenerFaseImplementacionPorId(id);

        try {
            const faseEliminada = await prisma.fase_Implementacion.delete({
                where: { id }
            });

            return faseEliminada;

        } catch {

            throw new ResponseDto(500, "Error al eliminar la fase de implementacion");

        }

    }

}
