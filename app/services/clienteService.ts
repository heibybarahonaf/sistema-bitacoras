import { z } from "zod";
import { ResponseDto } from "../common/dtos/response.dto";
import { prisma } from "../libs/prisma";
import { Cliente } from "@prisma/client";
import { CrearClienteDto } from "../dtos/cliente.dto";

const EditarClienteDto = CrearClienteDto.partial();
type EditarClienteDto = z.infer<typeof EditarClienteDto>;
type CrearClienteDto = z.infer<typeof CrearClienteDto>;

export class ClienteService {

    public static async obtenerClientes(): Promise<Cliente[]> {
        const clientes = await prisma.cliente.findMany({});

        if(clientes.length === 0){
            throw new ResponseDto(404, "No se encontraron clientes.");
        }

        return clientes;
    }


    public static async obtenerClientePorId(id: number): Promise<Cliente> {
    
        const cliente = await prisma.cliente.findUnique({ where: { id } });

        if(!cliente){
            throw new ResponseDto(404, "Cliente no encontrado.");
        }
    
        return cliente;
    }

    public static async obtenerClientePorEmpresa(empresa: string): Promise<Cliente> {
    
        const cliente = await prisma.cliente.findFirst({ where: { empresa: empresa.toUpperCase() }});

        if(!cliente){
            throw new ResponseDto(404, "Cliente no encontrado.");
        }
    
        return cliente;
    }


    public static async crearCliente(clienteData: CrearClienteDto): Promise<Cliente> {
        
        const empresaUpper = clienteData.empresa.toUpperCase();
        const clienteExistente = await prisma.cliente.findFirst({ where: { empresa: empresaUpper }});
        if (clienteExistente) {
            throw new ResponseDto(404, "La empresa ya está registrada.");
        }

        const cliente = await prisma.cliente.create({
            data: {
                ...clienteData,
                empresa: empresaUpper,
                correo: clienteData.correo.toLowerCase(),
            },
        });

         return cliente;

    }


    public static async editarCliente(id: number, clienteData: EditarClienteDto): Promise<Cliente> {
    
        const cliente = await this.obtenerClientePorId(id);
        const empresa = clienteData.empresa ? clienteData.empresa.toUpperCase() : undefined;
        const correo = clienteData.correo ? clienteData.correo.toLowerCase() : undefined;

        if (empresa && empresa !== cliente.empresa) {
            this.obtenerClientePorEmpresa(empresa)
        }

        const clienteActualizado = await prisma.cliente.update({
            where: { id },
            data: {
                ...clienteData,
                empresa: empresa || clienteData.empresa,
                correo: correo || clienteData.correo,
            },
        });

        return clienteActualizado;
    }

    public static async eliminarCliente(id: number): Promise<Cliente> {
        const cliente = await this.obtenerClientePorId(id);

        const clienteEliminado = await prisma.cliente.delete({
            where: { id },
        });

        return clienteEliminado;
    }



}
