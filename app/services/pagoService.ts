
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Pagos_Cliente } from "@prisma/client";
import { CrearPagoDto } from "../dtos/pago.dto";
import { ClienteService } from "./clienteService";
import { ResponseDto } from "../common/dtos/response.dto";

type CrearPagoDto = z.infer<typeof CrearPagoDto>; 
const EditarPagoDto = CrearPagoDto.omit({ monto: true, cant_horas: true, tipo_horas: true }).partial();
type EditarPagoDto = z.infer<typeof EditarPagoDto>;

export class PagoService {

    public static async obtenerPagos(
        page: number = 1,
        limit: number = 10,
        cliente?: string,
        filtroFactura?: string,
        fechaInicio?: string,
        fechaFin?: string,
    ): Promise<ResponseDto<Pagos_Cliente>> {

        const skip = (page - 1) * limit;
                const where: any = {};
        
        if (filtroFactura) {
            where.no_factura = { contains: filtroFactura, mode: 'insensitive' };
        }
        
        if (fechaInicio || fechaFin) {
            where.createdAt = {};
            if (fechaInicio) where.createdAt.gte = new Date(fechaInicio);
            if (fechaFin) where.createdAt.lte = new Date(fechaFin);
        }

        if (cliente) {
            where.cliente = {
                OR: [
                    { empresa: { contains: cliente, mode: 'insensitive' } },
                ]
            };
        }

        const [pagos, total] = await Promise.all([
            prisma.pagos_Cliente.findMany({
                where,
                skip,
                take: limit,
                include: { cliente: true },
                orderBy: { createdAt: "desc" }
            }),
            prisma.pagos_Cliente.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return new ResponseDto(
            pagos.length > 0 ? 200 : 404,
            pagos.length > 0 ? "Pagos recuperados con éxito" : "No se encontraron pagos",
            pagos,
            {
                total,
                page,
                limit,
                totalPages
            }
        );
    }


    public static async obtenerPagoPorId(id: number): Promise<Pagos_Cliente> {

        const pago = await prisma.pagos_Cliente.findUnique({ 
            where: { id },
            include: { cliente: true } 
        });

        if (!pago) {
            throw new ResponseDto(404, "Pago no encontrado");
        }

        return pago;

    }


    public static async obtenerPagosPorCliente(id: number): Promise<Pagos_Cliente[]> {

        const pagos = await prisma.pagos_Cliente.findMany({
            where: { cliente_id: id },
            orderBy: { createdAt: "desc" }
        });

        if (pagos.length === 0) {
            throw new ResponseDto(404, "No se encontraron pagos para este cliente");
        }

        return pagos;

    }


    public static async crearPago(pagoData: CrearPagoDto): Promise<Pagos_Cliente> {

        const cliente = await ClienteService.obtenerClientePorId(pagoData.cliente_id);

        try {
            const pagoExistente = await prisma.pagos_Cliente.findFirst({ where: { no_factura: pagoData.no_factura } });

            if (pagoExistente) {
                throw new ResponseDto(400, "Ya existe un pago con el mismo número de factura");
            }

            const pagoCreado = await prisma.pagos_Cliente.create({ data: pagoData });

            let datosActualizacion: { 
                horas_paquetes?: number; horas_individuales?: number; monto_paquetes?: number; monto_individuales?: number; 
            } = {};

            if (pagoData.tipo_horas === "Paquete") {

                const horasActuales = cliente.horas_paquetes ?? 0;
                const montoActual = cliente.monto_paquetes ?? 0;

                datosActualizacion = { 
                    horas_paquetes: horasActuales + pagoData.cant_horas, monto_paquetes: montoActual + pagoData.monto
                };

            } else if (pagoData.tipo_horas === "Individual") {

                const horasActuales = cliente.horas_individuales ?? 0;
                const montoActual = cliente.monto_individuales ?? 0;

                datosActualizacion = { 
                    horas_individuales: horasActuales + pagoData.cant_horas, monto_individuales: montoActual + pagoData.monto
                };
                
            } 

            await ClienteService.editarCliente(pagoData.cliente_id, datosActualizacion);
            return pagoCreado;

        } catch {
            
            throw new ResponseDto(500, "Error al crear el pago");

        }

    }


    public static async editarPago(id: number, pagoData: EditarPagoDto): Promise<Pagos_Cliente> {

        await this.obtenerPagoPorId(id);
        const { no_factura, forma_pago, detalle_pago} = pagoData;

        try {
            const pagoActualizado = await prisma.pagos_Cliente.update({
                where: { id },
                data: {
                    no_factura,
                    forma_pago,
                    detalle_pago,
                }
            });

            return pagoActualizado;

        } catch {

            throw new ResponseDto(500, "Error al editar el pago");

        }

    }

}
