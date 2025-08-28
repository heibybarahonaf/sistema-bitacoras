-- AlterTable
ALTER TABLE "bitacoras" ADD COLUMN     "accesorios" TEXT,
ADD COLUMN     "cantidad_impresiones" TEXT,
ADD COLUMN     "estado_fisico" TEXT,
ADD COLUMN     "falla_detectada" TEXT,
ADD COLUMN     "fecha_visita_siguiente" TIMESTAMP(3),
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "millaje" TEXT,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "no_factura" VARCHAR(10),
ADD COLUMN     "no_serie" TEXT,
ALTER COLUMN "comentarios" DROP NOT NULL,
ALTER COLUMN "ventas" DROP NOT NULL;
