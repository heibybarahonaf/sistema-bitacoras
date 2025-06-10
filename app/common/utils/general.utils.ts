import { ZodError } from "zod";
import { ResponseDto } from "../dtos/response.dto";
import { NextResponse } from "next/server";

export class GeneralUtils {

    public static validarIdParam(idParam: string): number{
        const id = parseInt(idParam)

        if (isNaN(id)) {
            throw new ResponseDto(400, "ID inválido");
        }

        return id;
    }


    public static generarErrorResponse(error: unknown) {
        if (error instanceof ResponseDto) {
            return NextResponse.json(error, { status: error.code });
        }

        return NextResponse.json(new ResponseDto(500, "Error interno del servidor"));
    }


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
