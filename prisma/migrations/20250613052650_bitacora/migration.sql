/*
  Warnings:

  - You are about to drop the column `encuesta_id` on the `bitacoras` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "bitacoras" DROP CONSTRAINT "bitacoras_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "bitacoras" DROP CONSTRAINT "bitacoras_firmaCLiente_id_fkey";

-- DropForeignKey
ALTER TABLE "bitacoras" DROP CONSTRAINT "bitacoras_firmaTecnico_id_fkey";

-- DropForeignKey
ALTER TABLE "bitacoras" DROP CONSTRAINT "bitacoras_sistema_id_fkey";

-- AlterTable
ALTER TABLE "bitacoras" DROP COLUMN "encuesta_id",
ALTER COLUMN "firmaTecnico_id" DROP NOT NULL,
ALTER COLUMN "firmaCLiente_id" DROP NOT NULL,
ALTER COLUMN "sistema_id" DROP NOT NULL,
ALTER COLUMN "equipo_id" DROP NOT NULL,
ALTER COLUMN "nombres_capacitados" DROP NOT NULL,
ALTER COLUMN "calificacion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "firmas" ALTER COLUMN "firma_base64" DROP NOT NULL;

-- CreateTable
CREATE TABLE "encuesta_bitacora" (
    "id" SERIAL NOT NULL,
    "bitacora_id" INTEGER NOT NULL,
    "encuesta_id" INTEGER NOT NULL,
    "respuestas" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encuesta_bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "encuesta_bitacora_bitacora_id_encuesta_id_key" ON "encuesta_bitacora"("bitacora_id", "encuesta_id");

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_firmaCLiente_id_fkey" FOREIGN KEY ("firmaCLiente_id") REFERENCES "firmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_firmaTecnico_id_fkey" FOREIGN KEY ("firmaTecnico_id") REFERENCES "firmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_sistema_id_fkey" FOREIGN KEY ("sistema_id") REFERENCES "sistemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_bitacora" ADD CONSTRAINT "encuesta_bitacora_bitacora_id_fkey" FOREIGN KEY ("bitacora_id") REFERENCES "bitacoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_bitacora" ADD CONSTRAINT "encuesta_bitacora_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
