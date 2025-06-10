import { z } from "zod";

export const CrearClienteDto = z.object({

    responsable: z.string()
        .max(200, "El responsable no debe exceder los 200 caracteres.")
        .min(1, "El nombre del responsable es obligatorio."),
    empresa: z.string()
        .max(100, "El nombre de la empresa no debe exceder los 100 caracteres.")
        .min(1, "El nombre de la empresa es obligatorio.")
        .transform(val => val.toUpperCase()),
    rtn: z.string()
        .max(50, "El RTN no debe exceder los 50 caracteres.")
        .min(1, "El RTN es obligatorio.")
        .regex(/^\d{14}$/, "El RTN debe tener exactamente 14 dígitos."),
    direccion: z.string()
        .max(30, "La dirección no debe exceder los 30 caracteres.")
        .min(1, "La dirección es obligatoria."),
    telefono: z.string()
        .min(8, "El teléfono debe tener al menos 8 caracteres.")
        .max(10, "El teléfono no debe exceder los 10 caracteres."),
    correo: z.string()
        .email("El correo no es válido.")
        .transform(val => val.toLowerCase()),
    activo: z.boolean({
        invalid_type_error: "El estado activo debe ser un valor booleano.",
    }),
    horas_paquetes: z.number()
        .int("Las horas de paquetes deben ser un número entero.")
        .nonnegative("Las horas de paquetes no pueden ser negativas."),
    horas_individuales: z.number()
        .int("Las horas individuales deben ser un número entero.")
        .nonnegative("Las horas individuales no pueden ser negativas."),
    monto_paquetes: z.number({
            required_error: "El monto es obligatorio.",
            invalid_type_error: "El monto debe ser un número.",
        })
        .nonnegative("El monto no puede ser negativo."),
    monto_individuales: z.number({
            required_error: "El monto es obligatorio.",
            invalid_type_error: "El monto debe ser un número.",
        })
        .nonnegative("El monto no puede ser negativo."),
        
});
