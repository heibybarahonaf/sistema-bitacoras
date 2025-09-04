import { NextResponse } from "next/server";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { BitacoraService } from "@/app/services/bitacoraService";
import { generarPDFPorVentasTecnico } from "@/app/services/reporteService";

export async function GET(request: Request) {

    try {

        const { searchParams } = new URL(request.url);
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFinal = searchParams.get('fechaFinal');
        const usuario = searchParams.get('usuario');

        if (!fechaInicio || !fechaFinal) {
            throw new ResponseDto(404, "Se requieren fechas de inicio y final");
        }

        if (usuario === "") {
            throw new ResponseDto(400, "Se requiere el nombre del técnico o 'Todos los técnicos'");
        }

        let bitacoras, buffer;

        if(usuario === "Todos" || !usuario){
            bitacoras = await BitacoraService.obtenerTodasBitacorasVentasFechas(fechaInicio, fechaFinal);
            buffer = await generarPDFPorVentasTecnico(bitacoras, fechaInicio, fechaFinal, "Todos");
        } else {
            bitacoras = await BitacoraService.obtenerBitacorasTecnicoVentasFechas(usuario, fechaInicio, fechaFinal);
            buffer = await generarPDFPorVentasTecnico(bitacoras, fechaInicio, fechaFinal, usuario);
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="usuario_${usuario}_${fechaInicio}_a_${fechaFinal}.pdf"`,
            },
        });

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}
