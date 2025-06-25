import { z } from "zod";

export const CrearFaseImplementacionDto = z.object({

    fase: z.string()
        .max(20, "El nombre de la fase no debe exceder los 200 caracteres.")
        .min(1, "El nombre de la fase es obligatoria."),
    descripcion: z.string()
        .max(255, "La descripción no debe exceder los 255 caracteres.")
        .min(1, "La descripción es obligatoria."),
    activa: z.boolean({
        required_error: "El campo 'activa' es obligatorio.",
        invalid_type_error: "El campo 'activa' debe ser un valor booleano.",
    }),

});
