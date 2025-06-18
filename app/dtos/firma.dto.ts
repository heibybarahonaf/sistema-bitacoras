import { z } from "zod";

export const CrearFirmaDto = z.object({
  firma_base64: z.string().min(1, "La firma en base64 es obligatoria."),
});

