"use client";

import Swal from "sweetalert2";
import { X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Sistema, Equipo, Tipo_Servicio, Fase_Implementacion, Bitacora as PrismaBitacora } from "@prisma/client";

interface Bitacora extends PrismaBitacora {
  firmaCliente?: {
    firma_base64?: string;
    url?: string;
  };
}

interface ModalDetalleBitacoraProps {
  isOpen: boolean;
  onClose: () => void;
  bitacora: Bitacora | null;
  sistemas: Sistema[];
  equipos: Equipo[];
  tipo_servicio: Tipo_Servicio[];
  fase_implementacion: Fase_Implementacion[];
  isLoading?: boolean;
}

export default function ModalDetalleBitacora({
  isOpen, onClose, bitacora, sistemas, equipos, 
  tipo_servicio, fase_implementacion, isLoading = false
}: ModalDetalleBitacoraProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [noSoportaClipboard, setNoSoportaClipboard] = useState(false);
  const [nombreTecnico, setNombreTecnico] = useState<string>("Cargando...");
  const [firmaTecnicoImg, setFirmaTecnicoImg] = useState<string | null>(null);
  const [firmaClienteImg, setFirmaClienteImg] = useState<string | null>(null);
  const [firmaClienteUrl, setFirmaClienteUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    if (isOpen && bitacora) {
      setFirmaTecnicoImg(null);
      setNombreTecnico("Cargando...");
      setFirmaClienteImg(null);
      setFirmaClienteUrl(null);
      
      cargarDatos(isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [bitacora, isOpen]);

  const cargarDatos = async (isMounted: boolean) => {
    if (!bitacora) return;

    try {
      const usuarioId = bitacora.usuario_id;
      const [firmaResponse, tecnicoResponse] = await Promise.all([
        fetch(`/api/firmas/tecnico/${usuarioId}`),
        fetch(`/api/usuarios/nombre/${usuarioId}`) 
      ]);

      /*if (!firmaResponse.ok || !tecnicoResponse.ok) {
        throw new Error('Error en las respuestas');
      }*/

      const [firmaData, tecnicoData] = await Promise.all([
        firmaResponse.json(),
        tecnicoResponse.json()
      ]);

      if (isMounted) {
        setFirmaTecnicoImg(firmaData.results?.[0]?.firma_base64 || null);
        
        const nombre = tecnicoData.results[0];
        setNombreTecnico(nombre || "Técnico no encontrado");

        const firmaCliente = bitacora.firmaCliente;
        if (firmaCliente?.firma_base64) {
          setFirmaClienteImg(firmaCliente.firma_base64);
          setFirmaClienteUrl(null);
        } else if (firmaCliente?.url) {
          setFirmaClienteImg(null);
          setFirmaClienteUrl(firmaCliente.url);
        }
      }

    } catch {
     
      if (isMounted) {
        setNombreTecnico("Error al cargar");
        setFirmaTecnicoImg(null);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Error cargando datos",
        });
      }
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        `}</style>
        <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#295d0c]"></div>
            <p className="text-gray-600">Cargando detalles de la bitácora...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bitacora) return null;

  const copiarAlPortapapeles = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText("https://" + firmaClienteUrl || "");
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Enlace copiado',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        setNoSoportaClipboard(true);
      }
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al copiar",
      });
      setNoSoportaClipboard(true);
    }
  };

  const sistemaNombre = sistemas.find((s) => s.id === bitacora.sistema_id)?.sistema || "";
  const equipoNombre = equipos.find((e) => e.id === bitacora.equipo_id)?.equipo || "";
  const tipoServicioNombre = tipo_servicio.find((t) => t.id === bitacora.tipo_servicio_id)?.tipo_servicio || "";
  const faseImplementacionNombre = fase_implementacion.find((f) => f.id === bitacora.fase_implementacion_id)?.fase || "";

  const truncarTexto = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const camposPrincipales = [
    { label: "Ticket", value: bitacora.no_ticket.toString()},
    {
      label: "Fecha del Servicio",
      value: new Date(bitacora.fecha_servicio).toLocaleDateString("es-HN", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    },
    {
      label: "Hora de Llegada",
      value: new Date(bitacora.hora_llegada).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      label: "Hora de Salida",
      value: new Date(bitacora.hora_salida).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    ...(bitacora.no_factura
      ? [{ label: "No. Factura", value: bitacora.no_factura }]
      : [{ label: "No. Factura", value: "N/A" }]),
    { label: "Horas Consumidas", value: bitacora.horas_consumidas },
    { label: "Tipo de Horas", value: bitacora.tipo_horas },
    { label: "Responsable", value: bitacora.responsable },
    { label: "Tipo de Servicio", value: tipoServicioNombre },
    ...(sistemaNombre ? [{ label: "Sistema", value: sistemaNombre }] : []),
    ...(equipoNombre ? [{ label: "Equipo", value: equipoNombre }] : []),
    { label: "Modalidad", value: bitacora.modalidad },
    ...(bitacora.nombres_capacitados
      ? [{ label: "Nombres Capacitados", value: bitacora.nombres_capacitados }]
      : []),
    ...(bitacora.ventas ? [{ label: "Posibles Ventas", value: bitacora.ventas }] : []),
    { label: "Fase de Implementación", value: faseImplementacionNombre },
    ...(bitacora.calificacion
      ? [{ label: "Calificación", value: bitacora.calificacion }]
      : [{ label: "Calificación", value: "ENCUESTA NO REALIZADA" }]),
  ];

  const camposEspeciales = [
    ...(bitacora.fecha_visita_siguiente ? [{ 
      label: "Siguiente Visita", 
      value: new Date(bitacora.fecha_visita_siguiente).toLocaleDateString("es-HN", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }), }] : []),
    ...(bitacora.millaje ? [{ label: "Millaje", value: bitacora.millaje }] : []),
    ...(bitacora.cantidad_impresiones ? [{ label: "Cant Impresiones", value: bitacora.cantidad_impresiones }] : []),
    ...(bitacora.marca ? [{ label: "Marca", value: truncarTexto(bitacora.marca) }] : []),
    ...(bitacora.modelo ? [{ label: "Modelo", value: truncarTexto(bitacora.modelo) }] : []),
    ...(bitacora.no_serie ? [{ label: "No. Serie", value: truncarTexto(bitacora.no_serie) }] : []),
    ...(bitacora.estado_fisico ? [{ label: "Estado", value: truncarTexto(bitacora.estado_fisico) }] : []),
    ...(bitacora.falla_detectada ? [{ label: "Fallas", value: truncarTexto(bitacora.falla_detectada) }] : []),
    ...(bitacora.accesorios ? [{ label: "Accesorios", value: truncarTexto(bitacora.accesorios) }] : []),
  ];

  const mostrarSeccionEspecial = camposEspeciales.length > 0;

  return (
    <>   
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto p-6">
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-medium mb-6 text-gray-800">
            Detalle de Bitácora
          </h2>

          {/* Sección de campos principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-sm">
            {camposPrincipales.map(({ label, value }) => (
              <div key={label} className="mb-2">
                <span className="font-medium text-gray-600 text-sm">{label}:</span>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                  {typeof value === "string"
                    ? value.trim() !== "" ? value : "-"
                    : value !== undefined && value !== null ? value : "-"}
                </p>
              </div>
            ))}
          </div>

          {/* Sección de campos especiales (si existen) */}
          {mostrarSeccionEspecial && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-base font-medium mb-3 text-gray-800">Detalles Mantenimiento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                {camposEspeciales.map(({ label, value }) => (
                  <div key={label} className="mb-2">
                    <span className="font-medium text-gray-600 text-sm">{label}:</span>
                    <p className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descripción y comentarios */}
          <div className="mt-6 border-t pt-6 text-sm">
            <div className="mb-4">
              <span className="font-medium text-gray-600 text-sm">Descripción:</span>
              <p className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                {bitacora.descripcion_servicio || "-"}
              </p>
            </div>

            {bitacora.comentarios && (
              <div className="mb-4">
                <span className="font-medium text-gray-600 text-sm">Comentarios:</span>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
                  {bitacora.comentarios && bitacora.comentarios.trim() !== "" 
                    ? bitacora.comentarios 
                    : "-"}
                </p>
              </div>
            )}
          </div>

          {/* Firmas */}
          <div className="mt-6 border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Firma Técnico */}
            <div className="flex flex-col items-center">
              {firmaTecnicoImg ? (
                <img
                  src={firmaTecnicoImg}
                  alt="Firma técnico"
                  className="border-b border-gray-300 max-w-xs w-full object-contain"
                />
              ) : (
                <span className="text-red-500 text-xs">PENDIENTE</span>
              )}
              <span className="font-medium text-gray-600 text-sm mt-2">Firma del Técnico</span>
              <span className="text-gray-800 text-sm">{nombreTecnico}</span>
            </div>

            {/* Firma Cliente */}
            <div className="flex flex-col items-center">
              {firmaClienteImg ? (
                <img
                  src={firmaClienteImg}
                  alt="Firma cliente"
                  className="border-b border-gray-300 max-w-xs w-full object-contain"
                />
              ) : firmaClienteUrl ? (
                <div className="text-center">
                  <span className="text-yellow-600 text-xs font-medium block mb-1">PENDIENTE</span>
                  <p className="text-xs text-gray-600 mb-2">El cliente aún no ha firmado.</p>

                  {noSoportaClipboard ? (
                    <div className="space-y-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={firmaClienteUrl}
                        readOnly
                        onFocus={() => inputRef.current?.select()}
                        className="border px-2 py-1 rounded w-full text-xs"
                      />
                      <p className="text-xs text-gray-500">
                        Copia el enlace manteniendo presionado
                      </p>
                    </div>
                  ) : (
                    <button
                      className="text-blue-500 hover:text-blue-700 text-xs underline"
                      onClick={copiarAlPortapapeles}
                    >
                      Copiar enlace de firma
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-yellow-600 text-xs">PENDIENTE</span>
              )}
              <span className="font-medium text-gray-600 text-sm mt-2">Firma del Cliente</span>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}