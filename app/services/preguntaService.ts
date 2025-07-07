import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Pregunta } from "@prisma/client";
import { CrearPreguntaDto } from "../dtos/pregunta.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

type CrearPreguntaDto = z.infer<typeof CrearPreguntaDto>;
const EitarPreguntaDto = CrearPreguntaDto;
type EitarPreguntaDto = z.infer<typeof CrearPreguntaDto>;

export class PreguntaService {

    public static async obtenerPreguntas(): Promise<Pregunta[]> {

        const preguntas = await prisma.pregunta.findMany({});

        if(preguntas.length === 0){
            throw new ResponseDto(404, "No se encontraron preguntas");
        }

        return preguntas;

    }


    public static async obtenerPreguntaPorId(id: number): Promise<Pregunta> {

        const pregunta = await prisma.pregunta.findUnique({ where: { id } });

        if(!pregunta){
            throw new ResponseDto(404, "Pregunta no encontrada");
        }
    
        return pregunta;

    }


    public static async crearPregunta(preguntaData: CrearPreguntaDto): Promise<Pregunta> {

        const preguntaExistente = await prisma.pregunta.findFirst({ where: { pregunta: preguntaData.pregunta }});
        
        if (preguntaExistente) {
            throw new ResponseDto(409, "La pregunta ya está registrada");
        }

        try {

            const pregunta = await prisma.pregunta.create({ data: preguntaData });
            return pregunta;

        } catch {

            throw new ResponseDto(500, "Error al crear la pregunta");

        }

    }


    public static async editarPregunta(id: number, preguntaData: EitarPreguntaDto): Promise<Pregunta> {
        
        const preguntaExistente = await this.obtenerPreguntaPorId(id);
        const { pregunta } = preguntaData;

        if (pregunta && pregunta !== preguntaExistente.pregunta) {
            const preguntaExiste = await prisma.pregunta.findFirst({ where: { pregunta } });
            if (preguntaExiste) {
                throw new ResponseDto(409, "La pregunta ya está registrada");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(preguntaData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }

        try {
            const preguntaActualizada = await prisma.pregunta.update({
                where: { id : id },
                data: datosActualizacion,
            });

            return preguntaActualizada;

        } catch {

            throw new ResponseDto(500, "Error al actualizar la pregunta");

        }

    }

}
