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
    firmaTecnico_id: z.number().optional(),
    firmaCLiente_id: z.number().optional(),
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
    tipo_servicio: z.string({
        required_error: "El tipo de servicio es obligatorio.",
        invalid_type_error: "El tipo de servicio debe ser un texto.",
    }).refine(val => val === "Soporte Equipo" || val === "Soporte Sistema", {
        message: "El tipo de servicio debe ser 'Soporte Equipo' o 'Soporte Sistema'."
    }),
    modalidad: z.string()
        .min(1, "La modalidad es obligatoria.")
        .max(100, "La modalidad no debe exceder los 100 caracteres."),
    responsable: z.string()
        .min(1, "El responsable es obligatorio.")
        .max(100, "El responsable no debe exceder los 100 caracteres."),
    nombres_capacitados: z.string(),
    descripcion_servicio: z.string()
        .min(1, "La descripción del servicio es obligatoria."),
    fase_implementacion: z.string()
        .min(1, "La fase de implementación es obligatoria.")
        .max(50, "La fase de implementación no debe exceder los 50 caracteres."),
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
    encuesta_id: z.number().optional(),

    })

    .refine(data => {
        return data.sistema_id !== undefined || data.equipo_id !== undefined;
    }, {
        message: "Se debe proporcionar al menos un sistema_id o equipo_id.",
        path: ["sistema_id", "equipo_id"]
    }

);
    