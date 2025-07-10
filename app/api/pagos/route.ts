import { NextResponse } from 'next/server';
import { CrearPagoDto } from '@/app/dtos/pago.dto';
import { PagoService } from '@/app/services/pagoService';
import { ResponseDto } from '@/app/common/dtos/response.dto';
import { GeneralUtils } from '@/app/common/utils/general.utils';

export async function GET(req: Request) {
    
    try {

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const factura = searchParams.get('factura');
        const cliente = searchParams.get('cliente');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFin = searchParams.get('fechaFin');

        const pagos = await PagoService.obtenerPagos(
            page,
            limit,
            cliente || undefined,
            factura || undefined,
            fechaInicio || undefined,
            fechaFin || undefined
        );
        
        return NextResponse.json(pagos);
        
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
