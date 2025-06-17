import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import Swal from 'sweetalert2';

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
  const [calificacion] = useState(0);
  const [ventas] = useState("NA");
  const [horasConsumidas, setHorasConsumidas] = useState(0);
  const [tipoHoras, setTipoHoras] = useState("Paquete");
  const [responsable, setResponsable] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [firmaTecnico, setFirmaTecnico] = useState<string | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (horaLlegada && horaSalida && fechaServicio) {
      const llegada = new Date(`${fechaServicio}T${horaLlegada}`);
      const salida = new Date(`${fechaServicio}T${horaSalida}`);
      const diferenciaMs = salida.getTime() - llegada.getTime();
      const diferenciaMin = diferenciaMs / (1000 * 60);

      if (!isNaN(diferenciaMin) && diferenciaMin > 0) {
        const horasEnteras = Math.floor(diferenciaMin / 60);
        const minutosRestantes = diferenciaMin % 60;
        const totalHoras = minutosRestantes > 15 ? horasEnteras + 1 : horasEnteras;
        setHorasConsumidas(totalHoras);
      } else {
        setHorasConsumidas(0);
      }
    }
  }, [horaLlegada, horaSalida, fechaServicio]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSistemas, resEquipos] = await Promise.all([
          fetch("/api/sistemas/activos"),
          fetch("/api/equipos/activos"),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fecha = new Date(fechaServicio);
      const llegada = new Date(`${fechaServicio}T${horaLlegada}`);
      const salida = new Date(`${fechaServicio}T${horaSalida}`);

      const newBitacora = {
        cliente_id: clienteId,
        usuario_id: 1,
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
        calificacion: 1,
        ventas: "NA",
        horas_consumidas: horasConsumidas,
        tipo_horas: tipoHoras,
        firma_tecnico: firmaTecnico,
        firmaCLiente_id: 1,
        encuesta_id: 1,
        modalidad: modalidad,
        responsable: responsable,
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
            <InputField label="No. Ticket" value={noTicket} onChange={setNoTicket} required />
            <InputField label="Fecha del Servicio" type="date" value={fechaServicio} onChange={setFechaServicio} required />
            <InputField label="Hora de Llegada" type="time" value={horaLlegada} onChange={setHoraLlegada} required />
            <InputField label="Hora de Salida" type="time" value={horaSalida} onChange={setHoraSalida} required />
            <InputField label="Responsable" value={responsable} onChange={setResponsable} required />

            <SelectSimple
              label="Tipo de Servicio"
              value={tipoServicio}
              onChange={setTipoServicio}
              options={["Soporte Equipo", "Soporte Sistema"]}
              required
            />

            {tipoServicio === "Soporte Sistema" && (
              <SelectField label="Sistema" value={sistemaId} options={sistemas} onChange={setSistemaId} />
            )}
            {tipoServicio === "Soporte Equipo" && (
              <SelectField label="Equipo" value={equipoId} options={equipos} onChange={setEquipoId} />
            )}

            <SelectSimple
              label="Tipo de Modalidad"
              value={modalidad}
              onChange={setModalidad}
              options={["Presencial", "Remoto", "Tienda"]}
              required
            />

            <InputField label="Nombres Capacitados" value={nombresCapacitados} onChange={setNombresCapacitados} required />
            <TextAreaField label="Descripción del Servicio" value={descripcionServicio} onChange={setDescripcionServicio} required />
            <SelectSimple
              label="Fase de Implementación"
              value={faseImplementacion}
              onChange={setFaseImplementacion}
              options={["Fase 1", "Fase 2", "Fase 3"]}
              required
            />
            <TextAreaField label="Comentarios" value={comentarios} onChange={setComentarios} />

            <div className="block">
              <span className="text-gray-700 font-medium">Horas Consumidas</span>
              <input
                type="number"
                readOnly
                value={horasConsumidas}
                className="mt-1 w-full border border-gray-300 bg-gray-100 text-gray-700 rounded-md px-3 py-2"
              />
            </div>

            <SelectSimple
              label="Tipo de Horas"
              value={tipoHoras}
              onChange={setTipoHoras}
              options={["Paquete", "Individual"]}
            />
          </div>

          {/* Firma del Técnico */}
          <div className="md:col-span-2">
            <span className="text-gray-700 font-medium block mb-1">Firma del Técnico</span>
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 350,
                height: 150,
                className: "border border-gray-300 rounded-md"
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => sigCanvas.current?.clear()}
                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                    const image = sigCanvas.current.getCanvas().toDataURL("image/png");
                    setFirmaTecnico(image);
                    Swal.fire({
                      icon: 'success',
                      title: '¡Firma guardada!',
                      text: 'La firma del técnico se ha guardado correctamente.',
                      timer: 1500,
                      showConfirmButton: false,
                    });
                  }
                }}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar Firma
              </button>
            </div>
          </div>

          {/* Botones */}
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

// Componentes reutilizables

const InputField = ({ label, type = "text", value, onChange, required = false }: any) => (
  <label className="block">
    <span className="text-gray-700 font-medium">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
    />
  </label>
);

const SelectField = ({ label, value, options, onChange }: any) => (
  <label className="block">
    <span className="text-gray-700 font-medium">{label}</span>
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
    >
      <option value="" disabled>Seleccione una opción</option>
      {options.map((opt: any) => (
        <option key={opt.id} value={opt.id}>{opt.sistema || opt.equipo}</option>
      ))}
    </select>
  </label>
);

const SelectSimple = ({ label, value, onChange, options, required = false }: any) => (
  <label className="block md:col-span-2">
    <span className="text-gray-700 font-medium">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
    >
      <option value="" disabled>Seleccione una opción</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </label>
);

const TextAreaField = ({ label, value, onChange, required = false }: any) => (
  <label className="block md:col-span-2">
    <span className="text-gray-700 font-medium">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
    />
  </label>
);

export default FormNuevaBitacora;
