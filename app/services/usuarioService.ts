import { z } from "zod";
import { prisma } from "../libs/prisma";
import { Usuario } from "@prisma/client";
import { CrearUsuarioDto } from "../dtos/usuario.dto";
import { AuthUtils } from "../common/utils/auth.utils";
import { ResponseDto } from "../common/dtos/response.dto";
import { GeneralUtils } from "../common/utils/general.utils";

const EditarUsuarioDto = CrearUsuarioDto.omit({ password: true }).partial();
type EditarUsuarioDto = z.infer<typeof EditarUsuarioDto>;
type CrearUsuarioDto = z.infer<typeof CrearUsuarioDto>;

export class UsuarioService {

    public static async obtenerUsuarios(): Promise<Usuario[]> {
        const usuarios = await prisma.usuario.findMany({});

        if(usuarios.length === 0){
            throw new ResponseDto(404, "No se encontraron usuarios");
        }

        return usuarios;
    }


    public static async obtenerUsuariosActivos(): Promise<Usuario[]> {
        const usuarios = await prisma.usuario.findMany({ 
            where: { 
                activo: true, 
                rol: "tecnico"
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
        const { nombre, correo, password, rol, activo, zona_asignada, telefono } = usuarioData;
        const emailExistente = await prisma.usuario.findFirst({ where: { correo: correo }});

        if (emailExistente) {
            throw new ResponseDto(409, "El email ya está registrado");
        }

        const hashedPassword = await AuthUtils.hashPassword(password);
        
        try {
            const usuario = await prisma.usuario.create({
                data: {
                    nombre,
                    correo: correo,
                    password: hashedPassword,
                    rol,
                    activo,
                    zona_asignada,
                    telefono,
                },
            });

            return usuario;

        } catch (error){

            console.log(error)
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
