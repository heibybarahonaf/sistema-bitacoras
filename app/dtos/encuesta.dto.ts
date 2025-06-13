import { z } from "zod";

export const CrearEncuestaDto = z.object({

    titulo: z.string()
        .max(200, "El titulo no debe exceder los 200 caracteres.")
        .min(1, "El titulo es obligatorio."),
    descripcion: z.string()
        .max(100, "La descripcion no debe exceder los 100 caracteres.")
        .min(1, "La descripcion es obligatoria."),
    activa: z.boolean({
        invalid_type_error: "El estado activa debe ser un valor booleano.",
    }),
    preguntas: z.array(z.number()).min(1, "Debe incluir al menos una pregunta"),

});
