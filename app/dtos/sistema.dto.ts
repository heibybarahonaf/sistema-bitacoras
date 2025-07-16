import { z } from "zod";

export const CrearSistemaDto = z.object({

    sistema: z.string()
        .max(200, "El nombre del sistema no debe exceder los 200 caracteres.")
        .min(1, "El nombre del sistema es obligatorio."),
    descripcion: z.string()
        .max(255, "La descripción no debe exceder los 255 caracteres.")
        .min(1, "La descripción es obligatoria."),
    activo: z.boolean({
        required_error: "El campo 'activo' es obligatorio.",
        invalid_type_error: "El campo 'activo' debe ser un valor booleano.",
    }),

});
