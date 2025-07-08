import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Usuario } from "@prisma/client";
import { CrearUsuarioDto } from "../dtos/usuario.dto";
import { AuthUtils } from "../common/utils/auth.utils";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

const EditarUsuarioDto = CrearUsuarioDto.partial();
type EditarUsuarioDto = z.infer<typeof EditarUsuarioDto>;
type CrearUsuarioDto = z.infer<typeof CrearUsuarioDto>;

interface PaginationResult {
    data: Usuario[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class UsuarioService {

    public static async obtenerUsuariosPaginados(page: number = 1, limit: number = 10, search: string = ""): Promise<PaginationResult> {
    
        const offset = (page - 1) * limit;
        const whereCondition = search 
            ? {
                nombre: {
                    contains: search,
                    mode: 'insensitive' as const
                }
            }
            : {};
    
        const [usuarios, total] = await Promise.all([
            prisma.usuario.findMany({
                where: whereCondition,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.usuario.count({
                where: whereCondition
            })
        ]);
    
        const totalPages = Math.ceil(total / limit);
        if (usuarios.length === 0 && total === 0) {
            throw new ResponseDto(404, "No se encontraron usuarios");
        }
    
        return { data: usuarios, total, page, limit, totalPages };
    
    }


    public static async obtenerUsuariosActivos(): Promise<Usuario[]> {

        const usuarios = await prisma.usuario.findMany({ 
            where: { 
                activo: true
            }  
        });

        if(usuarios.length === 0){
            throw new ResponseDto(404, "No se encontraron usuarios activos");
        }

        return usuarios;

    }


    public static async obtenerUsuarioPorId(id : number): Promise <Usuario> {

        const usuario = await prisma.usuario.findUnique({ where: { id }});

        if(!usuario){
            throw new ResponseDto(404, "Usuario no encontrado");
        }
        
        return usuario;

    }


    public static async obtenerUsuarioPorCorreo(correo: string): Promise<Usuario> {

        const usuario = await prisma.usuario.findFirst({ where: { correo: correo }});

        if(!usuario){
            throw new ResponseDto(404, "Usuario no encontrado");
        }
        
        return usuario;

    }


    public static async obtenerUsuarioPorNombre(nombre: string): Promise<Usuario> {

        const usuario = await prisma.usuario.findFirst({ where : { nombre: { contains: nombre, mode: 'insensitive' } }});

        if(!usuario){
            throw new ResponseDto(404, "Usuario no encontrado");
        }
        
        return usuario;

    }


    public static async crearUsuario(usuarioData: CrearUsuarioDto): Promise<Usuario> {

        const { correo, password } = usuarioData;
        const emailExistente = await prisma.usuario.findFirst({ where: { correo: correo }});

        if (emailExistente) {
            throw new ResponseDto(409, "El email ya está registrado");
        }

        const hashedPassword = await AuthUtils.hashPassword(password);
        
        try {
            const usuario = await prisma.usuario.create({
                data: {
                    ...usuarioData,
                    password: hashedPassword
                },
            });

            return usuario;

        } catch (error){

            throw new ResponseDto(500, "Error al crear el usuario");

        }
    
    }


    public static async editarUsuario(id: number, usuarioData: EditarUsuarioDto): Promise<Usuario> {

        const usuarioExistente = await this.obtenerUsuarioPorId(id);
        const { correo } = usuarioData;

        if (correo && correo !== usuarioExistente.correo) {
            const correoExiste = await prisma.usuario.findFirst({ where: { correo: correo }});

            if (correoExiste) {
                throw new ResponseDto(409, "El correo ya está registrado");
            }
        }

        const datosActualizacion = GeneralUtils.filtrarCamposActualizables(usuarioData);
        if (Object.keys(datosActualizacion).length === 0) {
            throw new ResponseDto(400, "No se proporcionaron datos para actualizar");
        }

        try {
            const usuarioActualizado = await prisma.usuario.update({
                where: { id: id },
                data: datosActualizacion,
            });

            return usuarioActualizado;

        } catch {

            throw new ResponseDto(500, "Error al actualizar el usuario");

        }

    }


    public static async eliminarUsuario(id: number): Promise<Usuario> {
        
        await this.obtenerUsuarioPorId(id);

        try {
            const usuarioEliminado = await prisma.usuario.delete({ where: { id: id }});

            return usuarioEliminado;

        } catch {

            throw new ResponseDto(500, "Error al eliminar el usuario");

        }

    }

}
