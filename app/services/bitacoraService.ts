import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Bitacora } from "@prisma/client";
import { CrearBitacoraDto } from "../dtos/bitacora.dto";
import { EquipoService } from "../services/equipoService";
import { ResponseDto } from "../common/dtos/response.dto";
import { ClienteService } from "../services/clienteService";
import { SistemaService } from "../services/sistemaService";
import { UsuarioService } from "../services/usuarioService";
import { EncuestaService } from "../services/encuestaService";
import { ConfiguracionService } from "../services/configService";

type CrearBitacoraDto = z.infer<typeof CrearBitacoraDto>;

export class BitacoraService {

    public static async obtenerBitacorasConFirma(bitacoraId: number): Promise<Bitacora> {
        
        const bitacora = await prisma.bitacora.findUnique({
            where: { id: bitacoraId },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                firmaCliente: true,
            },
        });

        if (!bitacora) {
            throw new ResponseDto(404, "Bitácora no encontrada");
        }

        return bitacora;
        
    }


    public static async obtenerBitacorasRangoFechas(fechaInicio: string, fechaFinal: string) {

        const bitacoras = await prisma.bitacora.findMany({
            where: {
                fecha_servicio: {
                    gte: new Date(fechaInicio),
                    lte: new Date(fechaFinal),
                },
            },
            include: {
                sistema: true,
                equipo: true,
                cliente: true,
                usuario: true,
                tipo_servicio: true,
            },
            orderBy: {
                fecha_servicio: "asc",
            },
        });

        if(bitacoras.length === 0){
            throw new ResponseDto(404, "No se encontraron bitacoras registradas en el rango de fechas ingresado");
        }

        return bitacoras;

    }


    public static async obtenerBitacoraPorId(id: number): Promise<Bitacora> {

        const bitacora = await prisma.bitacora.findFirst({ where: { id: id }});

        if(!bitacora){
            throw new ResponseDto(404, "No se encontro la bitacora");
        }

        return bitacora;

    }


    public static async obtenerBitacorasCliente(
        idCliente: number,
        page: number = 1,
        limit: number = 10,
        filtroEstado?: 'pendientes' | 'firmadas'
    ): Promise<ResponseDto<Bitacora>> {

        const skip = (page - 1) * limit;        
        const where: any = { cliente_id: idCliente };
        
        if (filtroEstado === 'pendientes') {
            where.firmaCliente = {
                is: { firma_base64: '' }
            };
        } else if (filtroEstado === 'firmadas') {
            where.firmaCliente = {
                is: { firma_base64: { not: '' } }
            };
        }

        const [bitacoras, total] = await Promise.all([
            prisma.bitacora.findMany({
                where,
                orderBy: { fecha_servicio: "desc" },
                include: {
                    fase_implementacion: true,
                    tipo_servicio: true,
                    sistema: true,
                    equipo: true,
                    firmaCliente: true,
                },
                skip,
                take: limit,
            }),
            prisma.bitacora.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);
        return new ResponseDto(
            200,
            bitacoras.length > 0 
                ? "Bitácoras obtenidas exitosamente" 
                : "No se encontraron bitácoras",
            bitacoras,
            {
                total,
                page,
                limit,
                totalPages
            }
        );

    }


    public static async obtenerBitacorasClienteFechas(rtn: string, fechaInicio: string, fechaFinal: string) {

        const cliente = await ClienteService.obtenerClientePorRtn(rtn);
        const bitacoras = await prisma.bitacora.findMany({
            where: {
                cliente_id: cliente.id,
                fecha_servicio: {
                    gte: new Date(fechaInicio),
                    lte: new Date(fechaFinal),
                },
            },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                tipo_servicio: true,
                fase_implementacion: true,
            },
            orderBy: { fecha_servicio: "desc" }
        });

        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras registradas con el cliente en el rango de fechas ingresado");
        }

        return bitacoras;

    }


    public static async obtenerBitacorasTecnicoFechas(nombre: string, fechaInicio: string, fechaFinal: string) {

        const tecnico = await UsuarioService.obtenerUsuarioPorNombre(nombre);
        const bitacoras = await prisma.bitacora.findMany({
            where: {
                usuario_id: tecnico.id,
                fecha_servicio: {
                    gte: new Date(fechaInicio),
                    lte: new Date(fechaFinal),
                },
            },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                tipo_servicio: true,
            },
            orderBy: { fecha_servicio: "desc" }
        });

        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras registradas con el técnico en el rango de fechas ingresado");
        }

        return bitacoras;

    }


    public static async obtenerBitacorasTecnicoVentasFechas(nombre: string, fechaInicio: string, fechaFinal: string) {

        const tecnico = await UsuarioService.obtenerUsuarioPorNombre(nombre);
        const bitacoras = await prisma.bitacora.findMany({
            where: {
                usuario_id: tecnico.id,
                fecha_servicio: {
                    gte: new Date(fechaInicio),
                    lte: new Date(fechaFinal),
                },
                ventas: {
                    not: {
                        equals: "",
                    },
                },
            },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                tipo_servicio: true,
            },
            orderBy: { fecha_servicio: "desc" }
        });

        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras de ventas registradas con el técnico en el rango de fechas ingresado");
        }

        return bitacoras;

    }


    public static async obtenerBitacorasTecnico(idTecnico: number): Promise<Bitacora[]> {

        const bitacoras = await prisma.bitacora.findMany({ 
            where: { usuario_id: idTecnico },
            orderBy: { fecha_servicio: "desc" }
        });

        if(bitacoras.length === 0){
            throw new ResponseDto(404, "No se encontraron bitacoras registradas con el tecnico");
        }

        return bitacoras;

    }


    public static async crearBitacora(bitacoraData: CrearBitacoraDto): Promise<Bitacora> {

        const cliente = await ClienteService.obtenerClientePorId(bitacoraData.cliente_id);
        await EncuestaService.obtenerEncuestaActiva();
        await UsuarioService.obtenerUsuarioPorId(bitacoraData.usuario_id);

        if (!bitacoraData.firmaTecnico){
            throw new ResponseDto(401, "La firma del tecnico es oblitaoria!");
        }

        if (bitacoraData.equipo_id !== undefined) {
            const equipo = await EquipoService.obtenerEquipoPorId(bitacoraData.equipo_id);

            if(!equipo.activo){
                throw new ResponseDto(401, "El Sistema Ingresado no se encuentra activo!");
            }

        } else if (bitacoraData.sistema_id !== undefined) {
            const sistema = await SistemaService.obtenerSistemaPorId(bitacoraData.sistema_id);

            if(!sistema.activo){
                throw new ResponseDto(401, "El Sistema Ingresado no se encuentra activo!");
            }
            
        }

        const { horas_consumidas, tipo_horas, cliente_id } = bitacoraData;
        const configuracion = await ConfiguracionService.obtenerConfiguracionPorId(1);
        let monto = 0;

        let datosActualizacion: { 
            horas_paquetes?: number; 
            horas_individuales?: number; 
            monto_paquetes?: number; 
            monto_individuales?: number; 
        };

        if (tipo_horas === "Individual") {
            const horasActuales = cliente.horas_individuales ?? 0;
            const montoActual = cliente.monto_individuales ?? 0;
            const montoIsv = configuracion.valor_hora_individual * (configuracion.comision / 100);
            const montoDebitado = horas_consumidas * (configuracion.valor_hora_individual + montoIsv);
            monto = montoDebitado;

            datosActualizacion = {
                horas_individuales: horasActuales - horas_consumidas,
                monto_individuales: montoActual - montoDebitado
            };

        } else if (tipo_horas === "Paquete") {
            const horasActuales = cliente.horas_paquetes ?? 0;
            const montoActual = cliente.monto_paquetes ?? 0;
            const montoIsv = configuracion.valor_hora_paquete * (configuracion.comision / 100);
            const montoDebitado = horas_consumidas * (configuracion.valor_hora_paquete + montoIsv);
            monto = montoDebitado;

            datosActualizacion = {
                horas_paquetes: horasActuales - horas_consumidas,
                monto_paquetes: montoActual - montoDebitado
            };

        } else {

            throw new ResponseDto(400, "Tipo de horas inválido. Debe ser 'Paquete' o 'Individual'");

        }

        try {

            const bitacora = await prisma.bitacora.create({
                data: {
                    ...bitacoraData,
                    firmaTecnico: true,
                    monto: monto
                }
            });

            await ClienteService.editarCliente(cliente_id, datosActualizacion);
            return bitacora;

        } catch {

            throw new ResponseDto(500, "Error interno del servidor al crear la bitácora");

        }

    }


    public static async obtenerBitacoraPorFirmaClienteId(firmaClienteId: number): Promise<Bitacora> {

        const bitacora = await prisma.bitacora.findFirst({
            where: { firmaCliente_id: firmaClienteId },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                firmaCliente: true,
            },
        });

        if (!bitacora) {

            throw new ResponseDto(404, "No se encontró la bitácora asociada a esta firma");

        }

        return bitacora;

    }


    public static async actualizarCalificacion(bitacoraId: number, calificacion: number) {

        return await prisma.bitacora.update({
            where: { id: bitacoraId },
            data: { calificacion },
        });

    }

}
