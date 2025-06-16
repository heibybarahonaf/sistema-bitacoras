import { z } from "zod";
import { Bitacora } from "@prisma/client";
import { ResponseDto } from "../common/dtos/response.dto";
import { prisma } from "../libs/prisma";
import { CrearBitacoraDto } from "../dtos/bitacora.dto";
import { ClienteService } from "./clienteService";
import { EquipoService } from "./equipoService";
import { SistemaService } from "./sistemaService";
import { EncuestaService } from "./encuestaService";
import { UsuarioService } from "./usuarioService";
import { ConfiguracionService } from "./configService";

type CrearBitacoraDto = z.infer<typeof CrearBitacoraDto>;

export class BitacoraService {

    public static async obtenerBitacoras(): Promise<Bitacora[]> {
        const bitacoras = await prisma.bitacora.findMany({ orderBy: { createdAt: "desc" }});

        if(bitacoras.length === 0){
            throw new ResponseDto(404, "No se encontraron bitacoras registradas");
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
            orderBy: { createdAt: "desc" }
        });

        if(bitacoras.length === 0){
            throw new ResponseDto(404, "No se encontraron bitacoras registradas con el cliente");
        }

        return bitacoras;
    }


    public static async obtenerBitacorasTecnico(idTecnico: number): Promise<Bitacora[]> {
        const bitacoras = await prisma.bitacora.findMany({ 
            where: { usuario_id: idTecnico },
            orderBy: { createdAt: "desc" }
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
                throw new ResponseDto(401, "El Sistema Ingresado no se encuentra acctivo!");
            }

        } else if (bitacoraData.sistema_id !== undefined) {
            const sistema = await SistemaService.obtenerSistemaPorId(bitacoraData.sistema_id);

            if(!sistema.activo){
                throw new ResponseDto(401, "El Sistema Ingresado no se encuentra acctivo!");
            }
            
        }

        const { horas_consumidas, tipo_horas, cliente_id } = bitacoraData;
        const configuracion = await ConfiguracionService.obtenerConfiguracionPorId(1);

        let datosActualizacion: { 
            horas_paquetes?: number; 
            horas_individuales?: number; 
            monto_paquetes?: number; 
            monto_individuales?: number; 
        };

        if (tipo_horas === "Individual") {
            const horasActuales = cliente.horas_individuales ?? 0;
            const montoActual = cliente.monto_individuales ?? 0;
            const montoDebitado = horas_consumidas * configuracion.valor_hora_individual;
            
            if (horasActuales < horas_consumidas || montoActual < montoDebitado) {
                throw new ResponseDto(400, "Saldo insuficiente en horas individuales.");
            }

            datosActualizacion = {
                horas_individuales: horasActuales - horas_consumidas,
                monto_individuales: montoActual - montoDebitado
            };

        } else if (tipo_horas === "Paquete") {
            const horasActuales = cliente.horas_paquetes ?? 0;
            const montoActual = cliente.monto_paquetes ?? 0;
            const montoDebitado = horas_consumidas * configuracion.valor_hora_paquete;
            
            if (horasActuales < horas_consumidas || montoActual < montoDebitado) {
                throw new ResponseDto(400, "Saldo insuficiente en horas de paquete.");
            }

            datosActualizacion = {
                horas_paquetes: horasActuales - horas_consumidas,
                monto_paquetes: montoActual - montoDebitado
            };

        } else {

            throw new ResponseDto(400, "Tipo de horas inválido. Debe ser 'Paquete' o 'Individual'");

        }
            
        try {
            // firma ejemplo - investigar
            const firmaTecnico = await prisma.firma.create({
                data: {
                    token: "token-tecnico-ejem",
                    firma_base64: "firma base 64",
                    usada: false,
                    url: "https://ejem.com/firmaTecnico"
                }
            });

            const firmaCliente = await prisma.firma.create({
                data: {
                    token: "token-cliente-ejem",
                    firma_base64: "firma base 64",
                    usada: false,
                    url: "https://ejem.com/firmaCliente"
                }
            });

            const { encuesta_id, ...bitacoraCampos } = bitacoraData;

            const bitacora = await prisma.bitacora.create({
                data: {
                    ...bitacoraCampos,
                    firmaTecnico_id: firmaTecnico.id,
                    firmaCLiente_id: firmaCliente.id,
                }
            });

            await prisma.encuesta_Bitacora.create({
                data: {
                    bitacora_id: bitacora.id,
                    encuesta_id: encuestaActiva.id,                
                },
            });

            await ClienteService.editarCliente(cliente_id, datosActualizacion);
            return bitacora;

        } catch (error) {

            throw new ResponseDto(500, "Error interno del servidor al crear la bitácora");
            
        }

    }

}
