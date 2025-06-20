-- CreateTable
CREATE TABLE "firmas" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "firma_base64" TEXT,
    "usada" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitacoras" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "firmaTecnico_id" INTEGER,
    "firmaCLiente_id" INTEGER,
    "no_ticket" VARCHAR(10) NOT NULL,
    "fecha_servicio" TIMESTAMP(3) NOT NULL,
    "hora_llegada" TIMESTAMP(3) NOT NULL,
    "hora_salida" TIMESTAMP(3) NOT NULL,
    "sistema_id" INTEGER,
    "equipo_id" INTEGER,
    "tipo_servicio" VARCHAR(100) NOT NULL,
    "modalidad" VARCHAR(100) NOT NULL,
    "responsable" VARCHAR(100) NOT NULL,
    "nombres_capacitados" TEXT,
    "descripcion_servicio" TEXT NOT NULL,
    "fase_implementacion" VARCHAR(50) NOT NULL,
    "comentarios" TEXT NOT NULL,
    "calificacion" INTEGER,
    "ventas" TEXT NOT NULL,
    "horas_consumidas" INTEGER NOT NULL,
    "monto" INTEGER,
    "tipo_horas" VARCHAR(25) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bitacoras_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "encuestas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(250) NOT NULL,
    "descripcion" VARCHAR(250) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "responsable" VARCHAR(200) NOT NULL,
    "empresa" TEXT NOT NULL,
    "rtn" VARCHAR(50) NOT NULL,
    "direccion" VARCHAR(30) NOT NULL,
    "telefono" VARCHAR(10) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "horas_paquetes" INTEGER NOT NULL,
    "horas_individuales" INTEGER NOT NULL,
    "monto_paquetes" INTEGER NOT NULL,
    "monto_individuales" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "password" VARCHAR(400) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'tecnico',
    "activo" BOOLEAN NOT NULL,
    "zona_asignada" VARCHAR(300) NOT NULL,
    "fecha_ingreso" TIMESTAMP(3) NOT NULL,
    "telefono" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sistemas" (
    "id" SERIAL NOT NULL,
    "sistema" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sistemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "equipo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_clientes" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "no_factura" VARCHAR(20) NOT NULL,
    "forma_pago" VARCHAR(50) NOT NULL,
    "detalle_pago" VARCHAR(50) NOT NULL,
    "monto" INTEGER NOT NULL,
    "tipo_horas" VARCHAR(20) NOT NULL,
    "cant_horas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" SERIAL NOT NULL,
    "pregunta" VARCHAR(250) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuesta_preguntas" (
    "id" SERIAL NOT NULL,
    "encuesta_id" INTEGER NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encuesta_preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" SERIAL NOT NULL,
    "correo_ventas" TEXT NOT NULL,
    "comision" INTEGER NOT NULL,
    "valor_hora_individual" INTEGER NOT NULL,
    "valor_hora_paquete" INTEGER NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "encuesta_bitacora_bitacora_id_encuesta_id_key" ON "encuesta_bitacora"("bitacora_id", "encuesta_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_correo_key" ON "clientes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "encuesta_preguntas_encuesta_id_pregunta_id_key" ON "encuesta_preguntas"("encuesta_id", "pregunta_id");

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_firmaCLiente_id_fkey" FOREIGN KEY ("firmaCLiente_id") REFERENCES "firmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_firmaTecnico_id_fkey" FOREIGN KEY ("firmaTecnico_id") REFERENCES "firmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_sistema_id_fkey" FOREIGN KEY ("sistema_id") REFERENCES "sistemas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_bitacora" ADD CONSTRAINT "encuesta_bitacora_bitacora_id_fkey" FOREIGN KEY ("bitacora_id") REFERENCES "bitacoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_bitacora" ADD CONSTRAINT "encuesta_bitacora_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_clientes" ADD CONSTRAINT "pagos_clientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_preguntas" ADD CONSTRAINT "encuesta_preguntas_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_preguntas" ADD CONSTRAINT "encuesta_preguntas_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "preguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
