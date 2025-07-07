import { ZodError } from "zod";
import { randomBytes } from 'crypto';
import { NextResponse } from "next/server";
import { ResponseDto } from "../dtos/response.dto";

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
        
        throw new ResponseDto(400, "Datos inválidos: " + erroresFormateados.map(e => e.mensajes), erroresFormateados);

    }


    public static filtrarCamposActualizables<T extends object>(datos: T): Partial<T> {

        return Object.fromEntries(Object.entries(datos).filter(([value]) => value !== undefined)) as Partial<T>;
        
    }


    public static generarCodigo(longitud: number): string {

        let codigo = '';
        
        while (codigo.length < longitud) {
            const bytes = randomBytes(longitud);

            for (const byte of bytes) {
                const digito = byte % 10;
                codigo += digito.toString();
                if (codigo.length === longitud) break;
            }

        }

        return codigo;

    }

}
