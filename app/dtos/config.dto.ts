import { z } from "zod";

export const CrearConfigDto = z.object({

    correo_ventas: z.string()
        .max(200, "El responsable no debe exceder los 200 caracteres.")
        .min(1, "El nombre del responsable es obligatorio."),
    comision: z.number()
        .int("Las horas individuales deben ser un número entero.")
        .nonnegative("Las horas individuales no pueden ser negativas."),
    valor_hora_paquete: z.number({
            required_error: "El valor del paquete es obligatorio.",
            invalid_type_error: "El valor del paquete debe ser un número.",
        })
        .nonnegative("El valor del paquete no puede ser negativo."),
    valor_hora_individual: z.number({
            required_error: "El valor individual es obligatorio.",
            invalid_type_error: "El valor individual debe ser un número.",
        })
        .nonnegative("El valor individual no puede ser negativo."),
        
});
