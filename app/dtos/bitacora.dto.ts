import { z } from "zod";

export const CrearBitacoraDto = z.object({

    cliente_id: z.number({
        required_error: "El ID del cliente es obligatorio.",
        invalid_type_error: "El ID del cliente debe ser un número.",
    }),
    usuario_id: z.number({
        required_error: "El ID del usuario es obligatorio.",
        invalid_type_error: "El ID del usuario debe ser un número.",
    }),
    no_ticket: z.string()
        .min(1, "El número de ticket es obligatorio.")
        .max(10, "El número de ticket no debe exceder los 10 caracteres."),
    fecha_servicio: z.coerce.date({
        invalid_type_error: "La fecha del servicio debe ser válida.",
    }),
    hora_llegada: z.coerce.date({
        invalid_type_error: "La hora de llegada debe ser válida.",
    }),
    hora_salida: z.coerce.date({
        invalid_type_error: "La hora de salida debe ser válida.",
    }),
    sistema_id: z.number({
        invalid_type_error: "El ID del sistema debe ser un número.",
    }).optional(),
    equipo_id: z.number({
        invalid_type_error: "El ID del equipo debe ser un número.",
    }).optional(),
    modalidad: z.string()
        .min(1, "La modalidad es obligatoria.")
        .max(100, "La modalidad no debe exceder los 100 caracteres."),
    responsable: z.string()
        .min(1, "El responsable es obligatorio.")
        .max(100, "El responsable no debe exceder los 100 caracteres."),
    nombres_capacitados: z.string(),
    descripcion_servicio: z.string()
        .min(1, "La descripción del servicio es obligatoria."),
    comentarios: z.string(),
    calificacion: z.number(),
    ventas: z.string(),
    horas_consumidas: z.number({
        required_error: "Las horas consumidas son obligatorias.",
        invalid_type_error: "Las horas consumidas deben ser un número.",
    }).int("Las horas consumidas deben ser un número entero."),
    tipo_horas: z.string({
        required_error: "El tipo de horas es obligatorio.",
        invalid_type_error: "El tipo de horas debe ser un texto.",
    }).refine(val => val === "Individual" || val === "Paquete", {
        message: "El tipo de horas debe ser 'Individual' o 'Paquete'."
    }),
    tipo_servicio_id: z.number({
        required_error: "El ID del tipo de servicio es obligatorio.",
        invalid_type_error: "El ID del tipo de servicio debe ser un número.",
    }),
    fase_implementacion_id: z.number({
        required_error: "El ID de la fase de implementación es obligatorio.",
        invalid_type_error: "El ID de la fase de implementación debe ser un número.",
    }),
    firmaTecnico: z.boolean({
        invalid_type_error: "El ID de la firma del técnico debe ser un booleano.",
    }).optional(),
    firmaCliente_id: z.number({
        invalid_type_error: "El ID de la firma del cliente debe ser un número.",
    }).optional(),

})

    .refine(data => {
        return data.sistema_id !== undefined || data.equipo_id !== undefined;
    }, {
        message: "Debe ingresar un sistema o equipo",
        path: ["sistema_id", "equipo_id"]
    }

);
    