import { z } from "zod";

export const CrearUsuarioDto = z.object({

    nombre: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres.")
        .max(200, "El nombre no puede exceder los 200 caracteres."),
    correo: z.string()
        .email("El correo no es válido.")
        .transform(val => val.toLowerCase()),
    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres."),
    rol: z.enum(["admin", "tecnico"]).default("tecnico"),
    activo: z.boolean().default(true),
    zona_asignada: z.string()
        .min(3, "La zona debe tener al menos 3 caracteres.")
        .max(300, "La zona no puede exceder los 300 caracteres."),
    telefono: z.string()
        .min(8, "El teléfono debe tener al menos 8 caracteres.")
        .max(10, "El teléfono no puede exceder los 10 caracteres."),
    comision: z.number(),

});
