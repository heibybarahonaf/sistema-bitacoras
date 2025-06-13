import React, { useEffect, useState } from "react";

interface FormNuevaBitacoraProps {
  clienteId: number;
  onClose: () => void;
  onGuardar: () => void;
}

interface Sistema {
  id: number;
  sistema: string;
}

interface Equipo {
  id: number;
  equipo: string;
}

const FormNuevaBitacora: React.FC<FormNuevaBitacoraProps> = ({
  clienteId,
  onClose,
  onGuardar,
}) => {
  // Estados del formulario
  const [noTicket, setNoTicket] = useState("");
  const [fechaServicio, setFechaServicio] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [sistemaId, setSistemaId] = useState<number | null>(null);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [tipoServicio, setTipoServicio] = useState("");
  const [nombresCapacitados, setNombresCapacitados] = useState("");
  const [descripcionServicio, setDescripcionServicio] = useState("");
  const [faseImplementacion, setFaseImplementacion] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [ventas, setVentas] = useState("");
  const [horasConsumidas, setHorasConsumidas] = useState(0);
  const [tipoHoras, setTipoHoras] = useState("paquete");

  useEffect(() => {
  if (horaLlegada && horaSalida && fechaServicio) {
    const llegada = new Date(`${fechaServicio}T${horaLlegada}`);
    const salida = new Date(`${fechaServicio}T${horaSalida}`);

    const diferenciaMs = salida.getTime() - llegada.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    // Solo actualiza si es un número válido y positivo
    if (!isNaN(diferenciaHoras) && diferenciaHoras > 0) {
      setHorasConsumidas(diferenciaHoras);
    } else {
      setHorasConsumidas(0); 
    }
  }
}, [horaLlegada, horaSalida, fechaServicio]);


  // Cargar sistemas y equipos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSistemas, resEquipos] = await Promise.all([
          fetch("/api/sistemas"),
          fetch("/api/equipos"),
        ]);

        const dataSistemas = await resSistemas.json();
        const dataEquipos = await resEquipos.json();

        setSistemas(dataSistemas.results || []);
        setEquipos(dataEquipos.results || []);
      } catch (err) {
        console.error("Error cargando sistemas o equipos", err);
      }
    };

    fetchData();
  }, []);

  // Guardar bitácora
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fecha = new Date(fechaServicio);
      const llegada = new Date(`${fechaServicio}T${horaLlegada}`);
      const salida = new Date(`${fechaServicio}T${horaSalida}`);

      const newBitacora = {
        cliente_id: clienteId,
        usuario_id: 1, // Reemplazar con ID del usuario logueado
        no_ticket: noTicket,
        fecha_servicio: fecha,
        hora_llegada: llegada,
        hora_salida: salida,
        sistema_id: sistemaId,
        equipo_id: equipoId,
        tipo_servicio: tipoServicio,
        nombres_capacitados: nombresCapacitados,
        descripcion_servicio: descripcionServicio,
        fase_implementacion: faseImplementacion,
        comentarios,
        calificacion,
        ventas,
        horas_consumidas: horasConsumidas,
        tipo_horas: tipoHoras,
        firmaTecnico_id: 1, // Reemplazar por lógica de firma
        firmaCLiente_id: 1,
        encuesta_id: 1,
      };

      const res = await fetch("/api/bitacoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBitacora),
      });

      if (!res.ok) throw new Error("Error al guardar la bitácora");

      onGuardar();
      onClose();
    } catch (error) {
      alert("Error al guardar: " + error);
    }
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Nueva Bitácora</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* No. Ticket */}
          <label className="block">
            <span className="text-gray-700 font-medium">No. Ticket</span>
            <input
              type="text"
              value={noTicket}
              onChange={(e) => setNoTicket(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              required
            />
          </label>

          {/* Fecha */}
          <label className="block">
            <span className="text-gray-700 font-medium">Fecha del Servicio</span>
            <input
              type="date"
              value={fechaServicio}
              onChange={(e) => setFechaServicio(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              required
            />
          </label>

          {/* Hora de llegada */}
          <label className="block">
            <span className="text-gray-700 font-medium">Hora de Llegada</span>
            <input
              type="time"
              value={horaLlegada}
              onChange={(e) => setHoraLlegada(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              required
            />
          </label>

          {/* Hora de salida */}
          <label className="block">
            <span className="text-gray-700 font-medium">Hora de Salida</span>
            <input
              type="time"
              value={horaSalida}
              onChange={(e) => setHoraSalida(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              required
            />
          </label>

          {/* Sistema */}
          <label className="block">
            <span className="text-gray-700 font-medium">Sistema</span>
            <select
              value={sistemaId ?? ""}
              onChange={(e) => setSistemaId(Number(e.target.value))}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="" disabled>Seleccione un sistema</option>
              {sistemas.map((s) => (
                <option key={s.id} value={s.id}>{s.sistema}</option>
              ))}
            </select>
          </label>

          {/* Equipo */}
          <label className="block">
            <span className="text-gray-700 font-medium">Equipo</span>
            <select
              value={equipoId ?? ""}
              onChange={(e) => setEquipoId(Number(e.target.value))}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="" disabled>Seleccione un equipo</option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>{e.equipo}</option>
              ))}
            </select>
          </label>

           {/* Tipo de servicio */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Tipo de Servicio</span>
            <select
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="" disabled>Seleccione un tipo de servicio</option>
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
            </select>
          </label>

          {/* Nombres Capacitados */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Nombres Capacitados</span>
            <input
              type="text"
              value={nombresCapacitados}
              onChange={(e) => setNombresCapacitados(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

          {/* Descripción del Servicio */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Descripción del Servicio</span>
            <textarea
              value={descripcionServicio}
              onChange={(e) => setDescripcionServicio(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

          {/* Fase de Implementación */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Fase de Implementación</span>
            <select
              value={faseImplementacion}
              onChange={(e) => setFaseImplementacion(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="" disabled>Seleccione una fase</option>
              <option value="Fase 1">Fase 1</option>
              <option value="Fase 2">Fase 2</option>
              <option value="Fase 3">Fase 3</option>
            </select>
          </label>

          {/* Comentarios */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Comentarios</span>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

          {/* Horas consumidas */}
          <label className="block">
            <span className="text-gray-700 font-medium">Horas consumidas</span>
            <input
              type="number"
              value={horasConsumidas}
              readOnly
              className="mt-1 w-full border border-gray-300 bg-gray-100 text-gray-700 rounded-md px-3 py-2"
            />
          </label>

          {/* Tipo de Horas */}
          <label className="block">
            <span className="text-gray-700 font-medium">Tipo de Horas</span>
            <select
              value={tipoHoras}
              onChange={(e) => setTipoHoras(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="paquete">Paquete</option>
              <option value="individuales">Individuales</option>
            </select>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a]"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default FormNuevaBitacora;
