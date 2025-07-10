import { NextResponse } from "next/server";
import { EmailService } from "@/app/services/emailService";
import { ResponseDto } from "@/app/common/dtos/response.dto";
import { ClienteService } from "@/app/services/clienteService";
import { GeneralUtils } from "@/app/common/utils/general.utils";
import { ConfiguracionService } from "@/app/services/configService";

interface DatosVenta {
    cliente?: string;
    ventas?: string;
    tecnico?: string;
    rtn?: string;
    telefono?: string;
    correo?: string;
}

export async function POST(req: Request) {

    try {
        const { nombreTecnico, nombreCliente, ventas } = await req.json();

        if (!nombreCliente) {
            throw new ResponseDto(400, "El nombre del cliente es requerido");
        }

        if (!ventas) {
            throw new ResponseDto(400, "Los detalles de la venta son requeridos");
        }

        if (!nombreTecnico) {
            throw new ResponseDto(400, "El tecnico es requerido");
        }

        const cliente = await ClienteService.obtenerClientePorEmpresa(nombreCliente);

        const datosVenta: DatosVenta = {
            tecnico: nombreTecnico,
            cliente: nombreCliente,
            telefono: cliente.telefono,
            correo: cliente?.correo || "",
            rtn: cliente.rtn,
            ventas
        };

        const configuracion = ConfiguracionService.obtenerConfiguracionPorId(1);
        const emailVentas = (await configuracion).correo_ventas;

        await EmailService.enviarNotificacionVenta(emailVentas, datosVenta);
        return NextResponse.json(new ResponseDto(200, "Notificación de venta enviada con éxito"));

    } catch (error) {

        return GeneralUtils.generarErrorResponse(error);

    }

}
