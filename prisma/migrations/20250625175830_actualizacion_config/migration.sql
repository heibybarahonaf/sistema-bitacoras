/*
  Warnings:

  - You are about to drop the column `fase_implementacion` on the `bitacoras` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_servicio` on the `bitacoras` table. All the data in the column will be lost.
  - Added the required column `fase_implementacion_id` to the `bitacoras` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_servicio_id` to the `bitacoras` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bitacoras" DROP COLUMN "fase_implementacion",
DROP COLUMN "tipo_servicio",
ADD COLUMN     "fase_implementacion_id" INTEGER NOT NULL,
ADD COLUMN     "tipo_servicio_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tipos_servicios" (
    "id" SERIAL NOT NULL,
    "tipo_servicio" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fases_implementacion" (
    "id" SERIAL NOT NULL,
    "fase" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fases_implementacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_fase_implementacion_id_fkey" FOREIGN KEY ("fase_implementacion_id") REFERENCES "fases_implementacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
