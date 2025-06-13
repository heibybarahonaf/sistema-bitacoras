import { z } from "zod";
import { NextResponse } from "next/server";
import { ResponseDto } from "../../../common/dtos/response.dto";
import { EncuestaService } from "../../../services/encuestaService";
import { CrearEncuestaDto } from "../../../dtos/encuesta.dto";
import { GeneralUtils } from "../../../common/utils/general.utils";

const EditarEncuestaDto = CrearEncuestaDto.partial();
type EditarEncuestaDto = z.infer<typeof EditarEncuestaDto>;

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {

        const id = GeneralUtils.validarIdParam(idParams);
        const encuesta = await EncuestaService.obtenerEncuestaPorId(id);

        return NextResponse.json(new ResponseDto(200, "Encuesta recuperada con éxito", [encuesta]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const idParams = (await params).id;

    try {

        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarEncuestaDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const encuestaActualizada = await EncuestaService.editarEncuesta(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Encuesta actualizada con éxito", [encuestaActualizada]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }


}
