import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Configuracion } from "@prisma/client";
import { CrearConfigDto } from "../dtos/config.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

const EditarConfigDto = CrearConfigDto.partial();
type EditarConfigDto = z.infer<typeof EditarConfigDto>;
type CrearConfigDto = z.infer<typeof CrearConfigDto>;

export class ConfiguracionService {

    public static async obtenerConfiguracionPorId(id: number): Promise<Configuracion> {

        const configuracion = await prisma.configuracion.findUnique({ where: { id } });

        if(!configuracion){
            throw new ResponseDto(404, "Configuracion no encontrada");
        }
    
        return configuracion;
        
    }


    public static async editarConfiguracion(id: number, configuracionData: EditarConfigDto): Promise<Configuracion> {

        await this.obtenerConfiguracionPorId(id);

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(configuracionData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }

        try {
            const configuracionActualizada = await prisma.configuracion.update({
                where: { id : id },
                data: datosActualizacion,
            });

            return configuracionActualizada;

        } catch {

            throw new ResponseDto(500, "Error al actualizar la configuracion");
            
        }

    }

}
