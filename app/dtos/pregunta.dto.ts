import { z } from "zod";

export const CrearPreguntaDto = z.object({

    pregunta: z.string()
        .max(200, "La pregunta no debe exceder los 200 caracteres.")
        .min(1, "La pregunta es obligatoria."),

});
