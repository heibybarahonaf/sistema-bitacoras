const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {


    /* USUARIO */
    const correo = process.env.USER_EMAIL;
    const usuarioExiste = await prisma.usuario.findUnique({
        where: { correo: correo },
    });

    if (!usuarioExiste) {
        const passwordHash = await bcrypt.hash(process.env.USER_PASS, 10);

        await prisma.usuario.create({
            data: {
                nombre: process.env.NAME_USER,
                correo: correo,
                password: passwordHash,
                zona_asignada: "N/A",
                telefono: "99999999",
                activo: true,
                comision: 0,
                rol: "admin",
            },
        });

        console.log("Usuario inicial creado correctamente");
    } else {
        console.log("El usuario incial ya existe");
    }


    /* Configuración */
    const condiguracionExiste = await prisma.configuracion.findUnique({
        where: { id: 1 },
    });

    if (!condiguracionExiste) {

        await prisma.configuracion.create({
            data: {
                correo_ventas: "gerenciacomercial@posdehonduras.com",
                valor_hora_individual: 700,
                valor_hora_paquete: 600,
                comision: 15,
            },
        });

        console.log("Configuración creada correctamente");
    } else {
        console.log("La configuración inicial ya existe");
    }


    /* Encuesta */
    const encuestaExiste = await prisma.encuesta.findMany();

    if (encuestaExiste.length===0) {

        await prisma.encuesta.create({
            data: {
                titulo: "Encuesta de Satisfacción",
                descripcion: "Evaluación de servicio",
                activa: true
            },
        });

        console.log("Encuesta creada correctamente");
    } else {
        console.log("La encuesta inicial ya existe");
    }


    /* Pregunta */
    const preguntaExiste = await prisma.pregunta.findMany();

    if (preguntaExiste.length===0) {

        await prisma.pregunta.create({
            data: {
                pregunta: "¿Qué tan satisfecho esta con el servicio realizado?"
            },
        });

        console.log("Pregunta creada correctamente");
    } else {
        console.log("La pregunta inicial ya existe");
    }


}

main().finally(() => prisma.$disconnect());
