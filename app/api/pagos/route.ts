import { NextResponse } from 'next/server';
import { ResponseDto } from '../../common/dtos/response.dto';
import { PagoService } from '../../services/pagoService';
import { CrearPagoDto } from '../../dtos/pago.dto';
import { GeneralUtils } from '../../common/utils/general.utils';

export async function GET() {

    try {

        const pagos = await PagoService.obtenerPagos();
        return NextResponse.json(new ResponseDto(200, "Pagos recuperados con éxito", [pagos]));

    } catch (error) {
        
        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function POST(req: Request) {

    try {

        const body = await req.json();
        const parsed = CrearPagoDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const pagoCreado = await PagoService.crearPago(parsed.data);
        return NextResponse.json(new ResponseDto(201, "Pago creado con éxito", [pagoCreado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);
        
    }

}
