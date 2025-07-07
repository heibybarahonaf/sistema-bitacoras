import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Encuesta } from "@prisma/client";
import { CrearEncuestaDto } from "../dtos/encuesta.dto";
import { ResponseDto } from "../common/dtos/response.dto";

type EncuestaPreguntas = {
    id: number;
    titulo: string;
    descripcion: string;
    activa: boolean;
    preguntas: {
        id: number;
        texto: string;
    }[];
};

const EditarEncuestaDto = CrearEncuestaDto.partial();
type EditarEncuestaDto = z.infer<typeof EditarEncuestaDto>;
type CrearEncuestaDto = z.infer<typeof CrearEncuestaDto>;

export class EncuestaService {

    public static async obtenerEncuestas(): Promise<Encuesta[]> {
        const encuestas = await prisma.encuesta.findMany({});

        if(encuestas.length === 0){
            throw new ResponseDto(404, "No se encontraron encuestas");
        }

        return encuestas;

    }


    public static async obtenerEncuestaActiva(): Promise<EncuestaPreguntas> {
        
        const encuesta = await prisma.encuesta.findFirst({
            where: { activa: true },
            include: {
            preguntas: {
                include: {
                pregunta: true,
                },
            },
            },
        });

        if (!encuesta) {
            throw new ResponseDto(404, "No se encontraron encuestas activas");
        }

        const preguntasMapeadas = encuesta.preguntas.map((p) => ({
            id: p.pregunta.id,
            texto: p.pregunta.pregunta,
        }));


        const encuestaConPreguntas = {
            id: encuesta.id,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            activa: encuesta.activa,
            preguntas: preguntasMapeadas,
        };

        return encuestaConPreguntas;

    }


    public static async obtenerEncuestasPreguntas(): Promise<EncuestaPreguntas[]> {

        const encuestas = await prisma.encuesta.findMany({include:{preguntas:{include:{pregunta:true}}}});

        if(encuestas.length == 0){
            throw new ResponseDto(400, "No hay encuestas registradas");
        }

        const encuestaPreguntas = encuestas.map(encuesta => ({
            id: encuesta.id,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            activa: encuesta.activa,
            preguntas: encuesta.preguntas.map(p => ({
                id: p.pregunta.id,
                texto: p.pregunta.pregunta
            }))
        }));

        return encuestaPreguntas;

    }


    public static async obtenerEncuestaPorId(id: number): Promise<EncuestaPreguntas> {

        const encuesta = await prisma.encuesta.findFirst({ where: { id }, include: { preguntas: { include: { pregunta: true }}}});

        if(!encuesta){
            throw new ResponseDto(400, "Encuesta no encontrada");
        }

        const encuestaPreguntas = {
            id: encuesta.id,
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            activa: encuesta.activa,
            preguntas: encuesta.preguntas.map(p => ({
                id: p.pregunta.id,
                texto: p.pregunta.pregunta
            })
        )};

        return encuestaPreguntas;

    }


    public static async crearEncuesta(encuestaData: CrearEncuestaDto): Promise<Encuesta> {

        const encuestaExistente = await prisma.encuesta.findFirst({ where: { titulo: encuestaData.titulo } });
        if (encuestaExistente) {
            throw new ResponseDto(409, "La encuesta ya está registrada");
        }

        // Desactivar cualquier encuesta activa existente
        await prisma.encuesta.updateMany({
            where: { activa: true },
            data: { activa: false }
        });

        await this.validarPreguntasEncuesta(encuestaData.preguntas);

        try {
            const encuesta = await prisma.encuesta.create({
                data: {
                    titulo: encuestaData.titulo,
                    descripcion: encuestaData.descripcion,
                    activa: true 
                }
            });

            const encuestaPreguntas = encuestaData.preguntas.map(preguntaId => ({
                encuesta_id: encuesta.id,
                pregunta_id: preguntaId
            }));

            await prisma.encuestaPregunta.createMany({ data: encuestaPreguntas });
            return encuesta;

        } catch {

            throw new ResponseDto(500, "Error al crear la encuesta con preguntas");

        }

    }


    public static async editarEncuesta(id: number, encuestaData: EditarEncuestaDto): Promise<Encuesta> {

        try{

            await this.obtenerEncuestaPorId(id);
    
            const encuestaExistente = await prisma.encuesta.findFirst({
                where: { titulo: encuestaData.titulo, NOT: { id: id } }
            });
            if (encuestaExistente) {
                throw new ResponseDto(409, "La encuesta ya está registrada");
            }
    
            if (encuestaData.preguntas) {
                await this.validarPreguntasEncuesta(encuestaData.preguntas);
                await prisma.encuestaPregunta.deleteMany({ where: { encuesta_id: id } });
    
                const nuevas = encuestaData.preguntas.map(pregunta_id => ({
                    encuesta_id: id,
                    pregunta_id
                }));
    
                await prisma.encuestaPregunta.createMany({ data: nuevas });
            }
    
            const encuestaActualizada = await prisma.encuesta.update({
                where: { id },
                data: {
                    titulo: encuestaData.titulo,
                    descripcion: encuestaData.descripcion,
                }
            });
    
            return encuestaActualizada;

        } catch{

            throw new ResponseDto(400, "Error al editar la encuesta!");
        
        }

    }


    public static async validarPreguntasEncuesta(preguntas: number[]) {
        
        const preguntasDuplicadas = preguntas.filter(
            (item, index) => preguntas.indexOf(item) !== index
        );

        if (preguntasDuplicadas.length > 0) {
            throw new ResponseDto(400, "No se deben repetir preguntas en la encuesta");
        }

        const preguntasExistentes = await prisma.pregunta.findMany({
            where: { id: { in: preguntas } }
        });

        if (preguntasExistentes.length !== preguntas.length) {
            const encontradas = preguntasExistentes.map(p => p.id);
            const noEncontradas = preguntas.filter(id => !encontradas.includes(id));

            throw new ResponseDto(400, `Se ingresaron preguntas inexistentes: ${noEncontradas.join(', ')}`);
        }

    }

}
