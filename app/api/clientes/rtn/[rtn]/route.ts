import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { ClienteService } from "@/app/services/clienteService";
import { GeneralUtils } from "@/app/common/utils/general.utils";

export async function GET(req: Request, { params }: { params: Promise<{ rtn: string }> }) {
    
    try {
        
        const rtnParams = (await params).rtn;
        if (rtnParams.length<13) {
            throw new ResponseDto(400, "RTN/ID inválido"); 
        }

        const cliente = await ClienteService.obtenerClientePorRtn(rtnParams);
        return NextResponse.json(new ResponseDto(200, "cliente recuperado con éxito", [cliente]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}