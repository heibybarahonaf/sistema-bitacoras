-- CreateTable
CREATE TABLE "firmas" (
    "id" SERIAL NOT NULL,
    "token" TEXT,
    "firma_base64" TEXT,
    "usada" BOOLEAN,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitacoras" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "encuesta_id" INTEGER NOT NULL,
    "firmaTecnico_id" INTEGER NOT NULL,
    "firmaCLiente_id" INTEGER NOT NULL,
    "no_ticket" VARCHAR(10),
    "fecha_servicio" TIMESTAMP(3),
    "hora_llegada" TIMESTAMP(3),
    "hora_salida" TIMESTAMP(3),
    "sistema_id" INTEGER NOT NULL,
    "tipo_servicio" VARCHAR(100),
    "nombres_capacitados" TEXT,
    "descripcion_servicio" TEXT,
    "fase_implementacion" VARCHAR(50),
    "comentarios" TEXT,
    "calificacion" INTEGER,
    "ventas" TEXT,
    "horas_consumidas" INTEGER,
    "tipo_horas" VARCHAR(25),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bitacoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_clientes" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "no_factura" VARCHAR(20),
    "forma_pago" VARCHAR(50),
    "detalle_pago" VARCHAR(50),
    "monto" DECIMAL(65,30),
    "tipo_horas" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "responsable" VARCHAR(200),
    "empresa" TEXT,
    "rtn" VARCHAR(50),
    "direccion" VARCHAR(30),
    "telefono" VARCHAR(10),
    "correo" VARCHAR(100),
    "fecha_registro" TIMESTAMP(3),
    "activo" BOOLEAN,
    "horas_paquetes" INTEGER,
    "horas_individuales" INTEGER,
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
    "activo" BOOLEAN,
    "zona_asignada" VARCHAR(300),
    "fecha_ingreso" TIMESTAMP(3),
    "telefono" VARCHAR(10),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuestas" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(250),
    "descripcion" VARCHAR(250),
    "activa" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuesta_preguntas" (
    "id" SERIAL NOT NULL,
    "encuesta_id" INTEGER NOT NULL,
    "pregunta" VARCHAR(250),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encuesta_preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encuesta_bitacora" (
    "id" SERIAL NOT NULL,
    "pregunta_id" INTEGER NOT NULL,
    "encuesta_id" INTEGER NOT NULL,
    "respuesta" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encuesta_bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sistemas" (
    "id" SERIAL NOT NULL,
    "sistema" VARCHAR(20),
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sistemas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_correo_key" ON "clientes"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "encuesta_bitacora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_sistema_id_fkey" FOREIGN KEY ("sistema_id") REFERENCES "sistemas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_firmaTecnico_id_fkey" FOREIGN KEY ("firmaTecnico_id") REFERENCES "firmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacoras" ADD CONSTRAINT "bitacoras_firmaCLiente_id_fkey" FOREIGN KEY ("firmaCLiente_id") REFERENCES "firmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_clientes" ADD CONSTRAINT "pagos_clientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_preguntas" ADD CONSTRAINT "encuesta_preguntas_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_bitacora" ADD CONSTRAINT "encuesta_bitacora_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "encuesta_preguntas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encuesta_bitacora" ADD CONSTRAINT "encuesta_bitacora_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
