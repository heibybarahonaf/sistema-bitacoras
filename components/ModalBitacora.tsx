"use client";

import Swal from "sweetalert2";
import SignatureCanvas from "react-signature-canvas";
import React, { useEffect, useState, useRef } from "react";

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

interface FaseImplementacion {
  id: number;
  fase: string;
}

interface TipoServicio {
  id: number;
  tipo_servicio: string;
}

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  readonly = false,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (val: any) => void;
  required?: boolean;
  readonly?: boolean;
}) => (
  <label className="block">
    <span className="text-gray-700 font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      readOnly={readonly}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
    />
  </label>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: number | null;
  options: { id: number; sistema?: string; equipo?: string }[];
  onChange: (val: number | null) => void;
  required?: boolean;
}) => (
  <label className="block">
    <span className="text-gray-700 font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
      required={required}
    >
      <option value="">Seleccione una opción</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.sistema || opt.equipo}
        </option>
      ))}
    </select>
  </label>
);

const SelectSimple = ({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  required?: boolean;
}) => (
  <label className="block md:col-span-2">
    <span className="text-gray-700 font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
    >
      <option value="" disabled>
        Seleccione una opción
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </label>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}) => (
  <label className="block md:col-span-2">
    <span className="text-gray-700 font-semibold">
      {label} {required && <span className="text-red-600">*</span>}
    </span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
      rows={4}
    />
  </label>
);

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
  const [nombresCapacitados, setNombresCapacitados] = useState("");
  const [descripcionServicio, setDescripcionServicio] = useState("");
  const [fasesImplementacion, setFasesImplementacion] = useState<FaseImplementacion[]>([]);
  const [faseImplementacionId, setFaseImplementacionId] = useState<number | null>(null);
  const [tipoServicio, setTipoServicio] = useState<TipoServicio[]>([]);
  const [tipoServicioId, setTipoServicioId] = useState<number | null>(null);
  const [comentarios, setComentarios] = useState("");
  const [horasConsumidas, setHorasConsumidas] = useState(0);
  const [tipoHoras, setTipoHoras] = useState("Paquete");
  const [responsable, setResponsable] = useState("");
  const [modalidad, setModalidad] = useState("Presencial");
  const [firmaClienteRemotaId, setFirmaClienteRemotaId] = useState<number | null>(null);
  const [urlFirmaRemota, setUrlFirmaRemota] = useState<string | null>(null);
  const [esperandoFirmaCliente, setEsperandoFirmaCliente] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const sigCanvasCliente = useRef<SignatureCanvas>(null);

  const generarNuevoEnlaceFirma = async () => {
    try {
      const res = await fetch("/api/firmas/remote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      const firma = json.results?.[0];
      if (firma) {
        setFirmaClienteRemotaId(firma.id);
        setUrlFirmaRemota(firma.url);
        setEsperandoFirmaCliente(true);
      }
    } catch {
      Swal.fire("Error", "No se pudo generar un nuevo enlace de firma.", "error");
    }
  };

  useEffect(() => {
  // Cargar sistemas, equipos, tipo de servicio y fases activas
  const fetchData = async () => {
    try {
      const [resSistemas, resEquipos, resFases, resServicios] = await Promise.all([
        fetch("/api/sistemas/activos"),
        fetch("/api/equipos/activos"),
        fetch("/api/fase-implementacion/activas"),
        fetch("/api/tipo-servicio/activos"),
      ]);

      const dataSistemas = await resSistemas.json();
      const dataEquipos = await resEquipos.json();
      const dataFases = await resFases.json();
      const dataServicios = await resServicios.json();

      setSistemas(dataSistemas.results || []);
      setEquipos(dataEquipos.results || []);
      setFasesImplementacion(dataFases.results || []);
      setTipoServicio(dataServicios.results || []);
    } catch (err) {
      console.error("Error cargando sistemas, equipos, tipo de servicio o fases", err);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    // Calcular horas consumidas
    if (horaLlegada && horaSalida && fechaServicio) {
      const llegada = new Date(`${fechaServicio}T${horaLlegada}`);
      const salida = new Date(`${fechaServicio}T${horaSalida}`);
      const diferenciaMin = (salida.getTime() - llegada.getTime()) / 60000;
      const horas = Math.floor(diferenciaMin / 60);
      const minutos = diferenciaMin % 60;
      const total = minutos > 15 ? horas + 1 : horas;
      setHorasConsumidas(diferenciaMin > 0 ? total : 0);
    }
  }, [horaLlegada, horaSalida, fechaServicio]);

  useEffect(() => {
  if (modalidad === "Remoto") {
    const generarEnlace = async () => {
      try {
        const res = await fetch("/api/firmas/remote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const json = await res.json();
        const firma = json.results?.[0];
        if (firma) {
          setFirmaClienteRemotaId(firma.id);
          setUrlFirmaRemota(firma.url);
          setEsperandoFirmaCliente(true);
        }
      } catch (error) {
        console.error("Error generando enlace de firma:", error);
      }
    };

    generarEnlace();
  } else {
    setUrlFirmaRemota(null);
    setFirmaClienteRemotaId(null);
    setEsperandoFirmaCliente(false);
  }
}, [modalidad]);

useEffect(() => {
  if (!firmaClienteRemotaId) return;

  const intervalo = setInterval(async () => {
    try {
      const res = await fetch(`/api/firmas/verificar/${firmaClienteRemotaId}`);
      const json = await res.json();

      if (json.vencida) {
        clearInterval(intervalo);
        setEsperandoFirmaCliente(false);
        setFirmaClienteRemotaId(null);
        setUrlFirmaRemota(null);

        Swal.fire({
          icon: "warning",
          title: "El enlace ha expirado",
          text: "Debe generar un nuevo enlace para que el cliente firme.",
        });

        return;
      }

      if (json.firmada) {
        setEsperandoFirmaCliente(false);
        clearInterval(intervalo);
      }
    } catch (error) {
      console.error("Error verificando firma remota:", error);
    }
  }, 10000); // cada 10s

  return () => clearInterval(intervalo);
}, [firmaClienteRemotaId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!modalidad) throw new Error("Seleccione la modalidad");

      if (!noTicket) throw new Error("No. Ticket es obligatorio");
      if (!fechaServicio) throw new Error("Fecha del servicio es obligatoria");
      if (!horaLlegada) throw new Error("Hora de llegada es obligatoria");
      if (!horaSalida) throw new Error("Hora de salida es obligatoria");
      if (!responsable) throw new Error("Responsable es obligatorio");
      if (!tipoServicio) throw new Error("Tipo de servicio es obligatorio");
      if (!descripcionServicio) throw new Error("Descripción del servicio es obligatoria");
      if (!fasesImplementacion) throw new Error("Fase de implementación es obligatoria");
      if (!tipoHoras) throw new Error("Tipo de horas es obligatorio");

      // Firma técnico obligatoria
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        throw new Error("Por favor, capture la firma del técnico.");
      }

      // Firma cliente solo si modalidad presencial
      if (modalidad === "Presencial" && sigCanvasCliente.current?.isEmpty()) {
        throw new Error("Por favor, capture la firma del cliente.");
      }
      // Obtener imágenes base64 de firmas
      const firmaTecnico = sigCanvas.current?.getCanvas().toDataURL("image/png");
      const firmaCliente =
        modalidad === "Presencial"
          ? sigCanvasCliente.current?.getCanvas().toDataURL("image/png")
          : null;

      // Guardar firmas en backend
      const resFirmaTecnico = await fetch("/api/firmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firma_base64: firmaTecnico }),
      });
      const dataFirmaTecnico = await resFirmaTecnico.json();
      if (!resFirmaTecnico.ok || !dataFirmaTecnico.results?.[0]?.id) {
        throw new Error("Error al guardar la firma del técnico");
      }
      const firmaTecnicoId = dataFirmaTecnico.results[0].id;

      let firmaClienteId: number | null = null;
      if (modalidad === "Presencial" && firmaCliente) {
        const resFirmaCliente = await fetch("/api/firmas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firma_base64: firmaCliente }),
        });
        const dataFirmaCliente = await resFirmaCliente.json();
        if (!resFirmaCliente.ok || !dataFirmaCliente.results?.[0]?.id) {
          throw new Error("Error al guardar la firma del cliente");
        }
        firmaClienteId = dataFirmaCliente.results[0].id;
      } else if (modalidad === "Remoto") {
        if (!firmaClienteRemotaId) {
          throw new Error("No se ha generado la firma remota del cliente.");
        }
        firmaClienteId = firmaClienteRemotaId;
      }


      const newBitacora = {
        cliente_id: clienteId,
        usuario_id: 1, //
        no_ticket: noTicket,
        fecha_servicio: fechaServicio,
        hora_llegada: new Date(`${fechaServicio}T${horaLlegada}`).toISOString(),
        hora_salida: new Date(`${fechaServicio}T${horaSalida}`).toISOString(),
        sistema_id: sistemaId || undefined,
        equipo_id: equipoId || undefined,
        nombres_capacitados: nombresCapacitados,
        descripcion_servicio: descripcionServicio,
        tipo_servicio_id: tipoServicioId,
        fase_implementacion_id: faseImplementacionId,
        comentarios,
        calificacion: 1, //
        ventas: "N/A", //
        horas_consumidas: horasConsumidas,
        tipo_horas: tipoHoras,
        firmaTecnico_id: firmaTecnicoId,
        firmaCLiente_id: firmaClienteId,
        modalidad,
        responsable,
      };


      // Guardar bitácora
      const res = await fetch("/api/bitacoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBitacora),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar la bitácora");
      }

      if (modalidad === "Remoto") {
  Swal.fire({
    icon: "info",
    title: "Bitácora guardada",
    html: `
      La bitácora se ha guardado, pero la firma del cliente está pendiente.<br />
      <strong>Enlace para firma remota:</strong><br />
      <button id="copyLinkBtn" style="
        background:none;
        border:none;
        color:#3085d6;
        text-decoration:underline;
        cursor:pointer;
        font-size:1rem;
        padding:0;
        ">
        ${urlFirmaRemota}
      </button>
    `,
    confirmButtonText: "OK",
    didOpen: () => {
      const copyBtn = Swal.getPopup()?.querySelector('#copyLinkBtn') as HTMLButtonElement;
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(urlFirmaRemota || '').then(() => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Enlace copiado',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
            });
          });
        });
      }
    },
  }).then(() => {
    onGuardar();
    onClose();
  });
} else {
  Swal.fire({
    icon: "success",
    title: "Bitácora guardada",
    text: "La bitácora se ha registrado correctamente.",
    confirmButtonText: "OK",
  }).then(() => {
    onGuardar();
    onClose();
  });
}


    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Nueva Bitácora</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="No. Ticket"
            value={noTicket}
            onChange={setNoTicket}
            required
          />
          <InputField
            label="Fecha del Servicio"
            type="date"
            value={fechaServicio}
            onChange={setFechaServicio}
            required
          />
          <InputField
            label="Hora de Llegada"
            type="time"
            value={horaLlegada}
            onChange={setHoraLlegada}
            required
          />
          <InputField
            label="Hora de Salida"
            type="time"
            value={horaSalida}
            onChange={setHoraSalida}
            required
          />
          <InputField
            label="Responsable"
            value={responsable}
            onChange={setResponsable}
            required
          />
          <SelectField
            label="Tipo de Servicio"
            value={tipoServicioId}
            onChange={setTipoServicioId}
            options={tipoServicio.map((s) => ({ id: s.id, sistema: s.tipo_servicio }))}
            required
          />
          <SelectField
            label="Equipo"
            value={equipoId}
            onChange={setEquipoId}
            options={equipos.map((e) => ({ id: e.id, sistema: e.equipo }))}
            
          />
          <SelectField
            label="Sistema"
            value={sistemaId}
            onChange={setSistemaId}
            options={sistemas.map((s) => ({ id: s.id, sistema: s.sistema }))}
            
          />
          <SelectSimple
            label="Modalidad"
            value={modalidad}
            onChange={setModalidad}
            options={["Presencial", "Remoto"]}
            required
          />
          <InputField
            label="Nombres Capacitados"
            value={nombresCapacitados}
            onChange={setNombresCapacitados}
          />
          <TextAreaField
            label="Descripción del Servicio"
            value={descripcionServicio}
            onChange={setDescripcionServicio}
            required
          />
          <SelectField
            label="Fase de Implementación"
            value={faseImplementacionId}
            onChange={setFaseImplementacionId}
            options={fasesImplementacion.map((f) => ({ id: f.id, sistema: f.fase }))}
            required
          />
          <TextAreaField
            label="Comentarios"
            value={comentarios}
            onChange={setComentarios}
          />
          <InputField
            label="Horas Consumidas"
            type="number"
            value={horasConsumidas}
            onChange={(v) => setHorasConsumidas(Number(v))}
            required
            readonly
          />
          <SelectSimple
            label="Tipo de Horas"
            value={tipoHoras}
            onChange={setTipoHoras}
            options={["Paquete", "Individual"]}
            required
          />

          {/* Firmas y enlace remoto lado a lado */}
<div className="md:col-span-2 flex flex-col sm:flex-row gap-6 justify-center items-start">
  {/* Firma técnico siempre visible */}
  <div className="flex-1 shadow-md rounded-md p-4 bg-white max-w-xs">
    <span className="text-gray-800 font-semibold block mb-1">
      Firma del Técnico <span className="text-red-600">*</span>
    </span>
    <SignatureCanvas
      ref={sigCanvas}
      penColor="black"
      canvasProps={{
        width: 350,
        height: 150,
        className: "border border-gray-300 rounded-md w-full shadow-sm",
      }}
    />
    <button
      type="button"
      onClick={() => sigCanvas.current?.clear()}
      className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Limpiar
    </button>
  </div>

  {/* Firma cliente presencial o mensaje enlace remoto */}
  {modalidad === "Presencial" ? (
    <div className="flex-1 shadow-md rounded-md p-4 bg-white max-w-xs">
      <span className="text-gray-800 font-semibold block mb-1">
        Firma del Cliente <span className="text-red-600">*</span>
      </span>
      <SignatureCanvas
        ref={sigCanvasCliente}
        penColor="black"
        canvasProps={{
          width: 350,
          height: 150,
          className: "border border-gray-300 rounded-md w-full shadow-sm",
        }}
      />
      <button
        type="button"
        onClick={() => sigCanvasCliente.current?.clear()}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Limpiar
      </button>
    </div>
  ) : (
    <div className="flex-1 shadow-md rounded-md p-4 bg-white max-w-xs">
    <span className="text-gray-800 font-semibold block mb-1">
      Firma del Cliente <span className="text-red-600">*</span>
    </span>

    {urlFirmaRemota ? (
      <div className="mt-2 text-sm text-gray-700">
        <p className="mb-1">ENLACE GENERADO PARA FIRMA REMOTA</p>
      </div>
    ) : (
      <p className="text-sm text-gray-500 italic">Generando enlace...</p>
    )}
  </div>
)}
</div>


          <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a] transition"
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

