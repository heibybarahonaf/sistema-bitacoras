import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { ConfiguracionService } from "@/app/services/configService";

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const { cantHoras, tipoHoras } = body;
        const configuracion = await ConfiguracionService.obtenerConfiguracionPorId(1);
        let monto = 0;

        if(tipoHoras=="Paquete"){
            monto = cantHoras * configuracion.valor_hora_paquete;
        }else if(tipoHoras=="Individual"){
            monto = cantHoras * configuracion.valor_hora_individual;
        }else{
            throw new ResponseDto(401, "El tipo de hora es invalido!");
        }
         
        monto = monto + ( monto * configuracion.comision);
        return NextResponse.json(new ResponseDto(200, "Monto calculado con éxito", [monto]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }
    
}
