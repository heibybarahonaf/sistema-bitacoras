import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Tipo_Servicio } from "@prisma/client";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";
import { CrearTipoServicioDto } from "../dtos/tipoServicio.dto";

const EditarTipoServicioDto = CrearTipoServicioDto.partial();
type EditarTipoServicioDto = z.infer<typeof EditarTipoServicioDto>;
type CrearTipoServicioDto = z.infer<typeof CrearTipoServicioDto>;

export class TipoServicioService {

    public static async obtenerTiposServicio(): Promise<Tipo_Servicio[]> {

        const tipos_servicio = await prisma.tipo_Servicio.findMany({});

        if (tipos_servicio.length === 0) {
            throw new ResponseDto(404, "No se encontraron tipos de servicio");
        }

        return tipos_servicio;

    }
    

    public static async obtenerTiposServicioActivos(): Promise<Tipo_Servicio[]> {

        const tipos_servicio = await prisma.tipo_Servicio.findMany({ where: { activo: true }});

        if (tipos_servicio.length === 0) {
            throw new ResponseDto(404, "No se encontraron tipos servicio activos");
        }

        return tipos_servicio;

    }


    public static async obtenerTipoServicioPorId(id: number): Promise<Tipo_Servicio> {

        const tipo_servicio = await prisma.tipo_Servicio.findUnique({ where: { id } });

        if (!tipo_servicio) {
            throw new ResponseDto(404, "Tipo servicio no encontrado");
        }

        return tipo_servicio;

    }


    public static async crearTipoServicio(tipoData: CrearTipoServicioDto): Promise<Tipo_Servicio> {

        const tipoExistente = await prisma.tipo_Servicio.findFirst({ where: { tipo_servicio: { contains: tipoData.tipo_servicio, mode: "insensitive" } } });

        if (tipoExistente) {
            throw new ResponseDto(409, "Ya existe un tipo de servicio con ese nombre");
        }

        try {
            const tipoCreado = await prisma.tipo_Servicio.create({
                data: tipoData 
            });

            return tipoCreado;

        } catch {

            throw new ResponseDto(500, "Error al crear el tipo de servicio");

        }

    }


    public static async editarTipoServicio(id: number, tipoData: EditarTipoServicioDto): Promise<Tipo_Servicio> {
        
        const tipoExistente = await this.obtenerTipoServicioPorId(id);
        const { tipo_servicio } = tipoData;

        if (tipo_servicio && tipo_servicio !== tipoExistente.tipo_servicio) {
            const tipoExistente = await prisma.tipo_Servicio.findFirst({ where: { tipo_servicio: tipo_servicio }});

            if (tipoExistente) {
                throw new ResponseDto(409, "El tipo de servicio ya está registrado");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(tipoData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }
        

        try {
            const tipoActualizado = await prisma.tipo_Servicio.update({
                where: { id },
                data: tipoData
            });

            return tipoActualizado;

        } catch {

            throw new ResponseDto(500, "Error al actualizar el tipo de servicio");

        }

    }


    public static async eliminarTipoServicio(id: number): Promise<Tipo_Servicio>{
        
        await this.obtenerTipoServicioPorId(id);

        try {
            const tipoEliminado = await prisma.tipo_Servicio.delete({
                where: { id }
            });

            return tipoEliminado;

        } catch {

            throw new ResponseDto(500, "Error al eliminar el tipo de servicio");

        }

    }

}
