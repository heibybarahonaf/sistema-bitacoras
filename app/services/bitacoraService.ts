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

export const EditarBitacoraDto = z.object({
    id: z.number(),
    respuestas: z.string().regex(/^(\d+(,\d+)*)?$/), //  "5,4,3" y asi
    calificacion: z.number(),
});

type CrearBitacoraDto = z.infer<typeof CrearBitacoraDto>;
type EditarBitacoraDto = z.infer<typeof EditarBitacoraDto>;

export class BitacoraService {

    public static async obtenerBitacoras(): Promise<Bitacora[]> {
        const bitacoras = await prisma.bitacora.findMany({ orderBy: { createdAt: "desc" }});

        if(bitacoras.length === 0){
            throw new ResponseDto(404, "No se encontraron bitacoras registradas");
        }

        return bitacoras;
    }


    public static async obtenerBitacorasConFirma(bitacoraId: number): Promise<Bitacora> {
        
        const bitacora = await prisma.bitacora.findUnique({
            where: { id: bitacoraId },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                firmaTecnico: true,
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


    public static async obtenerBitacorasCliente(idCliente: number): Promise<Bitacora[]> {
        const bitacoras = await prisma.bitacora.findMany({
            where: { cliente_id: idCliente },
            orderBy: { fecha_servicio: "desc" },
            include: {
            fase_implementacion: true,
            tipo_servicio: true,
            sistema: true,
            equipo: true,
            firmaCliente: true,
            },
        });

        if (bitacoras.length === 0) {
            throw new ResponseDto(404, "No se encontraron bitácoras registradas con el cliente");
        }

        return bitacoras;
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
        const encuestaActiva = await EncuestaService.obtenerEncuestaActiva();
        await UsuarioService.obtenerUsuarioPorId(bitacoraData.usuario_id);

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
            
            /*if (horasActuales < horas_consumidas || montoActual < montoDebitado) {
                throw new ResponseDto(400, "Saldo insuficiente en horas individuales.");
            }*/

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
            
            /*if (horasActuales < horas_consumidas || montoActual < montoDebitado) {
                throw new ResponseDto(400, "Saldo insuficiente en horas de paquete.");
            }*/

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
                    monto: monto
                }
            });
            
            /*
            await prisma.encuesta_Bitacora.create({
                data: {
                    bitacora_id: bitacora.id,
                    encuesta_id: encuestaActiva.id,                
                },
            });*/

            await ClienteService.editarCliente(cliente_id, datosActualizacion);
            return bitacora;

        } catch {

            throw new ResponseDto(500, "Error interno del servidor al crear la bitácora");

        }

    }


    public static async editarBitacora(bitacoraData: EditarBitacoraDto): Promise<Bitacora> {
        const encuestaActiva = await EncuestaService.obtenerEncuestaActiva();
        const { id, respuestas, calificacion } = bitacoraData;

        const bitacora = await prisma.bitacora.findUnique({
            where: { id },
        });

        if (!bitacora) throw new Error("Bitácora no encontrada");
        const bitacoraActualizada = await prisma.bitacora.update({
            where: { id },
            data: {
                calificacion,
                updatedAt: new Date(),
            },
        });

        await prisma.encuesta_Bitacora.create({
            data: {
            bitacora_id: id,
            encuesta_id: encuestaActiva.id,
            respuestas: respuestas, 
            },
        });

        return bitacoraActualizada;

    }


    public static async obtenerBitacoraPorFirmaClienteId(firmaClienteId: number): Promise<Bitacora> {
        const bitacora = await prisma.bitacora.findFirst({
            where: { firmaCLiente_id: firmaClienteId },
            include: {
                cliente: true,
                usuario: true,
                sistema: true,
                equipo: true,
                firmaTecnico: true,
                firmaCliente: true,
            },
        });

        if (!bitacora) {

            throw new ResponseDto(404, "No se encontró la bitácora asociada a esta firma");

        }

        return bitacora;
    }

}
