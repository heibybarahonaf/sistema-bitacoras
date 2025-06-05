import { ZodError } from "zod";
import { ResponseDto } from "../dtos/response.dto";

export class GeneralUtils {

    public static zodValidationError(error: ZodError): never {
        const fieldErrors = error.flatten().fieldErrors;

        const erroresFormateados = Object.entries(fieldErrors).map(([campo, mensajes]) => ({
            campo,
            mensajes,
        }));
        
        throw new ResponseDto(400, "Datos inválidos", erroresFormateados);
    }


    public static filtrarCamposActualizables<T extends object>(datos: T): Partial<T> {
        return Object.fromEntries(Object.entries(datos).filter(([_, value]) => value !== undefined)) as Partial<T>;
    }

}
