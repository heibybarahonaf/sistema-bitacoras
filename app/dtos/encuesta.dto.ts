import { z } from "zod";

export const CrearEncuestaDto = z.object({

  titulo: z.string()
    .max(200, "El título no debe exceder los 200 caracteres.")
    .min(1, "El título es obligatorio."),
  descripcion: z.string()
    .max(100, "La descripción no debe exceder los 100 caracteres.")
    .min(1, "La descripción es obligatoria."),
  preguntas: z.array(z.number())
    .min(1, "Debe incluir al menos una pregunta")
    
});
