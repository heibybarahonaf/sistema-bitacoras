import { z } from "zod";

export const LoginDto = z.object({

    correo: z.string().email("Correo inválido"),
    password: z.string().min(6, "Contraseña requerida"),
    codigo: z.string().length(6, "El código debe tener 6 dígitos"),

});
