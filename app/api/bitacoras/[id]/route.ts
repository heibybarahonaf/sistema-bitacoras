import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { obtenerPayloadSesion } from "@/app/common/utils/session.utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacora = await BitacoraService.obtenerBitacorasConFirma(id);

        return NextResponse.json(new ResponseDto(200, "Bitacora recuperada con éxito", [bitacora]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {

        const payload = await obtenerPayloadSesion();
        if (payload.rol !== "admin") {
            return NextResponse.json(new ResponseDto(403, "No tienes permiso para realizar esta acción!"));
        }
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const bitacoraEliminada = await BitacoraService.eliminarBitacora(id);
        
        return NextResponse.json(new ResponseDto(200, "Bitácora eliminado con éxito", [bitacoraEliminada]));
        
    } catch (error) {
      
        return GeneralUtils.generarErrorResponse(error);
        
    }

}
