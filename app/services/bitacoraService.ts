// services/bitacoraService.ts

import { prisma } from "../libs/prisma";

export class BitacoraService {
  static async obtenerBitacorasPorCliente(clienteId: number) {
    return prisma.bitacora.findMany({
      where: { cliente_id: clienteId },
      include: {
        sistema: true,
        usuario: true,
      },
      orderBy: {
        fecha_servicio: "desc",
      },
    });
  }
}
