import { z } from "zod";

export const ActualizarCalificacionDto = z.object({

  calificacion: z.number().min(0).max(10),

});