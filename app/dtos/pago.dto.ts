import { z } from 'zod';

export const CrearPagoDto = z.object({

    cliente_id: z.number({
        required_error: "El ID del cliente es obligatorio.",
        invalid_type_error: "El ID del cliente debe ser un número.",
    }),
    no_factura: z.string()
        .max(20, "El número de factura no debe exceder los 20 caracteres.")
        .min(1, "El número de factura es obligatorio."),
    forma_pago: z.string()
        .max(50, "La forma de pago no debe exceder los 50 caracteres.")
        .min(1, "La forma de pago es obligatoria."),
    detalle_pago: z.string()
        .max(50, "El detalle del pago no debe exceder los 50 caracteres.")
        .min(1, "El detalle del pago es obligatorio."),
    monto: z.number({
            required_error: "El monto es obligatorio.",
            invalid_type_error: "El monto debe ser un número.",
        })
        .positive("El monto debe ser mayor que cero."),
    tipo_horas: z.string({
        required_error: "El tipo de horas es obligatorio.",
        invalid_type_error: "El tipo de horas debe ser un texto.",
    }).refine(val => val === "Individual" || val === "Paquete", {
        message: "El tipo de horas debe ser 'Individual' o 'Paquete'."
    }),
    cant_horas: z.number({
            required_error: "La cantidad de horas es obligatoria.",
            invalid_type_error: "La cantidad de horas debe ser un número.",
        })
        .int("La cantidad de horas debe ser un número entero.")
        .min(0, "La cantidad de horas no puede ser negativa."),

});
