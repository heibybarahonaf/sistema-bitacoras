"use client";

import Swal from "sweetalert2";
import SignatureCanvas from "react-signature-canvas";
import React, { useEffect, useState, useRef } from "react";
import { Sistema, Equipo, Tipo_Servicio, Fase_Implementacion } from "@prisma/client";

interface FormNuevaBitacoraProps {
  clienteId: number;
  nombreCliente: string;
  onClose: () => void;
  onGuardar: () => void;
  horasPaquete: number;
  horasIndividuales: number;
  sistemas: Sistema[];
  equipos: Equipo[];
  tipoServicio: Tipo_Servicio[];
  fases: Fase_Implementacion[];
}

interface SelectSimpleProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[] | { value: string; label: string }[];
  required?: boolean;
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
}: SelectSimpleProps) => {
  const opciones = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <label className="block">
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
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
    </label>
  );
};

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
  nombreCliente,
  onClose,
  onGuardar,
  horasPaquete,
  horasIndividuales,
  fases,
  sistemas,
  equipos,
  tipoServicio,
}) => {
  const [ventas, setVentas] = useState("");
  const [usuario, setUsuario] = useState("");
  const [noTicket, setNoTicket] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [responsable, setResponsable] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [tipoHoras, setTipoHoras] = useState("Paquete");
  const [fechaServicio, setFechaServicio] = useState("");
  const [horasConsumidas, setHorasConsumidas] = useState(0);
  const [nombresCapacitados, setNombresCapacitados] = useState("");
  const [descripcionServicio, setDescripcionServicio] = useState("");
  
  const [usuarioId, setUsuarioId] = useState<number>(1);
  const [equipoId, setEquipoId] = useState<number | null>(null);
  const [sistemaId, setSistemaId] = useState<number | null>(null);
  const [tipoServicioId, setTipoServicioId] = useState<number | null>(null);
  const [urlFirmaRemota, setUrlFirmaRemota] = useState<string | null>(null);
  const [firmaClienteRemotaId, setFirmaClienteRemotaId] = useState<number | null>(null);
  const [faseImplementacionId, setFaseImplementacionId] = useState<number | null>(null);
  
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [guardando, setGuardando] = useState(false);
  const sigCanvasCliente = useRef<SignatureCanvas>(null);
  //const [cargarFirmaTecnico, setCargarFirmaTecnico] = useState(false);
  const [esperandoFirmaCliente, setEsperandoFirmaCliente] = useState(false);
  const [horasDisponibles, setHorasDisponibles] = useState({paquete: horasPaquete, individual: horasIndividuales});

  useEffect(() => {
    if (sigCanvas.current) {
      sigCanvas.current.off(); 
    }
  }, []);


  /*const generarNuevoEnlaceFirma = async () => {
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
  };*/


  useEffect(() => {

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

    const cargarFirmaTecnico = async () => {


      try {
        const res = await fetch("/api/auth/obtener-sesion", {
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("No se pudo obtener la sesión del usuario");
        
        const data = await res.json();
        const tecnicoId = Number(data.results[0].id);
        setUsuarioId(tecnicoId);
        setUsuario(String(data.results[0].nombre));

        if (tecnicoId) {
          const firmaRes = await fetch(`/api/firmas/tecnico/${tecnicoId}`);
          const firmaData = await firmaRes.json();

          if (firmaData.code !== 200) {
            //console.warn("No se encontró firma del técnico.");
            return;
          }

          const firma = firmaData.results?.[0];
          const firmaBase64 = firma?.firma_base64;

          if (!firmaBase64) {
            //console.warn("El técnico no tiene firma registrada.");
            return;
          }

          if (sigCanvas.current) {
            const canvas = sigCanvas.current.getCanvas();
            const ctx = canvas.getContext("2d");
            const image = new Image();
            image.onload = () => {
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
              ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
            image.src = firmaBase64;
          }
        }
      } catch {
        
        Swal.fire(
          "Error",
          "Ocurrió un error al intentar cargar automáticamente la firma del técnico.",
          "error"
        );

      }
    };

    cargarFirmaTecnico();
  }, []);


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
        } catch {

          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Error generando enlace de firma",
          });
         
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

      if (json.firmada) {
        setEsperandoFirmaCliente(false);
        clearInterval(intervalo);
      }

    } catch {

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error verificando firma remota",
      });
     
    }
  }, 10000); // cada 10s

  return () => clearInterval(intervalo);
}, [firmaClienteRemotaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {

      if (!modalidad) throw new Error("Seleccione la modalidad");
      if (!noTicket) throw new Error("No. Ticket es obligatorio");
      if (!responsable) throw new Error("Responsable es obligatorio");
      if (!tipoHoras) throw new Error("Tipo de horas es obligatorio");
      if (!horaSalida) throw new Error("Hora de salida es obligatoria");
      if (!horaLlegada) throw new Error("Hora de llegada es obligatoria");
      if (!tipoServicioId) throw new Error("Tipo de servicio es obligatorio");
      if (!fechaServicio) throw new Error("Fecha del servicio es obligatoria");
      if (!faseImplementacionId) throw new Error("Fase de implementación es obligatoria");
      if (!descripcionServicio) throw new Error("Descripción del servicio es obligatoria");

      // Firma cliente solo si modalidad presencial
      if ((modalidad === "Presencial" || modalidad === "En Oficina") && sigCanvasCliente.current?.isEmpty()) {
        throw new Error("Por favor, capture la firma del cliente.");
      }

      const firmaCliente =
        modalidad === "Presencial" || modalidad === "En Oficina"
          ? sigCanvasCliente.current?.getCanvas().toDataURL("image/png")
          : null;

      let firmaClienteId: number | null = null;
      if ((modalidad === "Presencial" || modalidad === "En Oficina") && firmaCliente) {

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

      console.log("ID:: ", usuarioId);
      console.log("Nombre:: ", usuario);

      const newBitacora = {
        cliente_id: clienteId,
        usuario_id: usuarioId,
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
        calificacion: 0,
        ventas,
        horas_consumidas: horasConsumidas,
        tipo_horas: tipoHoras,
        firmaTecnico: true,
        firmaCliente_id: firmaClienteId,
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

      if (ventas && ventas.trim() !== "") {

        const notificacionRes = await fetch("/api/notificacion-ventas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreTecnico: usuario,
            nombreCliente: nombreCliente,    
            ventas,
          }),
        });

        if (!notificacionRes.ok) {
          
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title:
              "Error al enviar notificación de ventaError al cargar los datos para crear bitacora",
          });
          
        }
      }

      if (modalidad === "Remoto") {
        Swal.fire({
          icon: "info",
          title: "Bitácora guardada",
          html: `
            La bitácora se ha guardado, pero la firma del cliente está pendiente.<br />
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
        const data = await res.json();
        const nuevaBitacora = data.results?.[0];
        const encuestaUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/encuesta/${nuevaBitacora?.id}`;

        const clipboardSoportado = typeof navigator.clipboard !== "undefined";

        Swal.fire({
          icon: "success",
          title: "Bitácora guardada",
          html: `
            La bitácora se ha guardado correctamente.<br/>
            Puedes compartir este enlace con el cliente para la encuesta:<br/><br/>
            <input type="text" id="encuestaLink" class="swal2-input" value="${encuestaUrl}" readonly />
            ${
              typeof navigator.clipboard !== "undefined"
                ? `<button type="button" id="copyEncuestaBtn" class="swal2-confirm swal2-styled" style="margin-top: 10px;">
                    Copiar enlace
                  </button>`
                : `<p class="text-sm text-gray-600 italic mt-2">
                    Mantén presionado el campo de texto para copiar el enlace manualmente.
                  </p>`
            }
          `,
          showConfirmButton: false,
          didOpen: () => {
            const input = document.getElementById("encuestaLink") as HTMLInputElement;
            input?.select();

            if (typeof navigator.clipboard !== "undefined") {
              const copyBtn = document.getElementById("copyEncuestaBtn");
              copyBtn?.addEventListener("click", () => {
                navigator.clipboard.writeText(encuestaUrl).then(() => {
                  Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Enlace copiado al portapapeles",
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                  }).then(() => {
                    onGuardar();
                    onClose();
                  });
                });
              });
            }
          },
        });
      }

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error instanceof Error ? error.message : String(error),
      });

    }finally {
      setGuardando(false); 
    }
  };

  return (
    <div className="fixed inset-0 text-xs bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-6 text-gray-900">Nueva Bitácora</h2>

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
            options={["Presencial", "Remoto", "En Oficina"]}
            required
          />
          <SelectField
            label="Fase de Implementación"
            value={faseImplementacionId}
            onChange={setFaseImplementacionId}
            options={fases.map((f) => ({ id: f.id, sistema: f.fase }))}
            required
          />
          <InputField
            label="Nombres Capacitados"
            value={nombresCapacitados}
            onChange={setNombresCapacitados}
          />
          <InputField
            label="Oportunidad de negocio"
            value={ventas}
            onChange={setVentas}
          />
          <TextAreaField
            label="Descripción del Servicio"
            value={descripcionServicio}
            onChange={setDescripcionServicio}
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
            options={[
              { 
                value: "Paquete", 
                label: `Paquete (${horasDisponibles.paquete}h disponibles)` 
              },
              { 
                value: "Individual", 
                label: `Individual (${horasDisponibles.individual}h disponibles)` 
              }
            ]}
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

              <p className="mt-2 text-sm text-gray-500 italic"></p>

            </div>

            {/* Firma cliente presencial o mensaje enlace remoto */}
            {modalidad === "Presencial" || modalidad === "En Oficina" ? (
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
                <div className="mt-2 text-sm text-gray-700 text-center">
                  <p className="text-sm text-gray-700 mb-2">Enlace para firma remota.</p>

                  {typeof navigator.clipboard === "undefined" ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={urlFirmaRemota}
                        readOnly
                        onFocus={(e) => e.target.select()}
                        className="border px-2 py-1 rounded w-full text-sm"
                      />
                      <p className="text-xs text-gray-600">
                        <strong>Mantén presionado para copiar el enlace</strong>
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(urlFirmaRemota)
                          .then(() =>
                            Swal.fire({
                              toast: true,
                              position: "top-end",
                              icon: "success",
                              title: "Enlace copiado",
                              showConfirmButton: false,
                              timer: 1500,
                              timerProgressBar: true,
                            })
                          )
                          .catch((err) => {
             
                            Swal.fire("Error", "No se pudo copiar el enlace.", "error");
                          })
                      }
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                    >
                      Copiar enlace de firma
                    </button>
                  )}
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
              disabled={guardando}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                guardando
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#295d0c] hover:bg-[#23480a] text-white"
              }`}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormNuevaBitacora;

