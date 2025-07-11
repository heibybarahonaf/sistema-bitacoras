const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const correoMaster = "admin@miapp.com";

    const existe = await prisma.usuario.findUnique({
        where: { correo: correoMaster },
    });

    if (!existe) {
        const passwordHash = await bcrypt.hash("passwordSuperSeguro123", 10);

        await prisma.usuario.create({
            data: {
                nombre: "Master",
                correo: correoMaster,
                password: passwordHash,
                zona_asignada: "N/A",
                telefono: "99999999",
                activo: true,
                comision: 0,
                rol: "admin",
            },
        });

      console.log("✅ Usuario master creado correctamente.");
    } else {
      console.log("⚠️ El usuario master ya existe, no se creó duplicado.");
    }
}

main().finally(() => prisma.$disconnect());
