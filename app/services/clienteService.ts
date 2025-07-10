import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Cliente } from "@prisma/client";
import { CrearClienteDto } from "../dtos/cliente.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

const EditarClienteDto = CrearClienteDto.partial();
type EditarClienteDto = z.infer<typeof EditarClienteDto>;
type CrearClienteDto = z.infer<typeof CrearClienteDto>;

interface PaginationResult {
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ClienteService {

    public static async obtenerClientesPaginados(page: number = 1, limit: number = 10, search: string = ""): Promise<PaginationResult> {

        const offset = (page - 1) * limit;
        const whereCondition = search 
            ? {
                OR: [
                    { empresa: { contains: search, mode: 'insensitive' as const } },
                    { rtn: { contains: search, mode: 'insensitive' as const } }
                ]
            }
            : {};

        const [clientes, total] = await Promise.all([
            prisma.cliente.findMany({
                where: whereCondition,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.cliente.count({
                where: whereCondition
            })
        ]);

        const totalPages = Math.ceil(total / limit);
        if (clientes.length === 0 && total === 0) {
            throw new ResponseDto(404, "No se encontraron clientes");
        }

        return { data: clientes, total, page, limit, totalPages };

    }


    public static async obtenerClientePorId(id: number): Promise<Cliente> {
        
        const cliente = await prisma.cliente.findUnique({ where: { id } });

        if(!cliente){
            throw new ResponseDto(404, "Cliente no encontrado");
        }
    
        return cliente;

    }


    public static async obtenerClientePorEmpresa(empresa: string): Promise<Cliente> {

        const cliente = await prisma.cliente.findFirst({ where: { empresa: { contains: empresa, mode: "insensitive" } }});

        if(!cliente){
            throw new ResponseDto(404, "Cliente no encontrado");
        }
    
        return cliente;

    }


    public static async obtenerClientePorRtn(rtn: string): Promise<Cliente> {

        const rtnLimpio = rtn.replace(/\D/g, "").trim();
        const cliente = await prisma.cliente.findFirst({ where: { rtn: rtnLimpio }});

        if(!cliente){
            throw new ResponseDto(404, "Cliente no encontrado");
        }
    
        return cliente;

    }


    public static async crearCliente(clienteData: CrearClienteDto): Promise<Cliente> {

        const clienteExistente = await prisma.cliente.findFirst({ where: { empresa: clienteData.empresa }});
        const emailExistente = await prisma.cliente.findFirst({ where: { correo: clienteData.correo }});
        const rtnExistente = await prisma.cliente.findFirst({ where: { rtn: clienteData.rtn }});
        
        if (emailExistente) {
            throw new ResponseDto(409, "El email ya está registrado");
        }

        if (clienteExistente) {
            throw new ResponseDto(409, "La empresa ya está registrada");
        }

        if (rtnExistente) {
            throw new ResponseDto(409, "El RTN/ID ya está registrado");
        }

        const { correo } = clienteData;

        try {
            const cliente = await prisma.cliente.create({
                data: {
                    ...clienteData,
                    correo: correo || ""
                }
            });

            return cliente;

        } catch {

            throw new ResponseDto(500, "Error al crear el cliente");

        }

    }


    public static async editarCliente(id: number, clienteData: EditarClienteDto): Promise<Cliente> {

        const clienteExistente = await this.obtenerClientePorId(id);
        const { empresa, rtn, correo } = clienteData;

        if (correo && correo !== clienteExistente.correo) {
            const correoExiste = await prisma.cliente.findFirst({ where: { correo }});
            if (correoExiste) {
                throw new ResponseDto(409, "El correo ya está registrado");
            }
        }

        if (empresa && empresa !== clienteExistente.empresa) {
            const empresaExiste = await prisma.cliente.findFirst({ where: { empresa }});

            if (empresaExiste) {
                throw new ResponseDto(409, "La empresa ya está registrada");
            }
        }

        if (rtn && rtn !== clienteExistente.rtn) {
            const rtnExiste = await prisma.cliente.findFirst({ where: { rtn }});

            if (rtnExiste) {
                throw new ResponseDto(409, "El RTN/ID ya está registrado");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(clienteData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }

        try {
            const clienteActualizado = await prisma.cliente.update({
                where: { id : id },
                data: datosActualizacion,
            });

            return clienteActualizado;

        } catch {

            throw new ResponseDto(500, "Error al actualizar el cliente");

        }

    }


    public static async eliminarCliente(id: number): Promise<Cliente> {

        await this.obtenerClientePorId(id);

        try {
            const clienteEliminado = await prisma.cliente.delete({ where: { id }});

            return clienteEliminado;

        } catch {

            throw new ResponseDto(500, "Error al eliminar el cliente");

        }

    }

}
