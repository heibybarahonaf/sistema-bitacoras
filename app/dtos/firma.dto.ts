import { z } from "zod";

export const CrearFirmaDto = z.object({

    firma_base64: z.string().optional(),
    tecnico_id: z.number().optional(),
    usada: z.boolean().default(false),
    token: z.string().optional(),
    url: z.string().optional(),

});
