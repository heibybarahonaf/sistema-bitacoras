import { z } from "zod";
import { NextResponse } from "next/server";
import { ClienteService } from "@/app/services/clienteService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { CrearClienteDto } from "@/app/dtos/cliente.dto";
import { GeneralUtils } from "@/app/common/utils/general.utils";

const EditarClienteDto = CrearClienteDto.partial();
type EditarClienteDto = z.infer<typeof EditarClienteDto>;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const cliente = await ClienteService.obtenerClientePorId(id);

        return NextResponse.json(new ResponseDto(200, "Cliente recuperado con éxito", [cliente]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const body = await req.json();
        const parsed = EditarClienteDto.safeParse(body);

        if (!parsed.success) {
            GeneralUtils.zodValidationError(parsed.error);
        }

        const clienteActualizado = await ClienteService.editarCliente(id, parsed.data);
        return NextResponse.json(new ResponseDto(200, "Cliente actualizado con éxito", [clienteActualizado]));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}


export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        
        const idParams = (await params).id;
        const id = GeneralUtils.validarIdParam(idParams);
        const clienteEliminado = await ClienteService.eliminarCliente(id);
        
        return NextResponse.json(new ResponseDto(200, "Cliente eliminado con éxito", [clienteEliminado]));
        
    } catch (error) {
      
        return GeneralUtils.generarErrorResponse(error);
        
    }

}
