"use client";

import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Sistema {
  id: number;
  sistema: string;
}

interface Equipo {
  id: number;
  equipo: string;
}

interface TipoServicio {
  id: number;
  tipo_servicio: string;
}

interface FaseImplementacion {
  id: number;
  fase: string;
}

interface ModalDetalleBitacoraProps {
  isOpen: boolean;
  onClose: () => void;
  bitacora: any | null;
  sistemas: Sistema[];
  equipos: Equipo[];
  tipo_servicio: TipoServicio[];
  fase_implementacion: FaseImplementacion[];
}

export default function ModalDetalleBitacora({
  isOpen,
  onClose,
  bitacora,
  sistemas,
  equipos,
  tipo_servicio,
  fase_implementacion,
}: ModalDetalleBitacoraProps) {
  const [firmaTecnicoImg, setFirmaTecnicoImg] = useState<string | null>(null);
  const [firmaClienteImg, setFirmaClienteImg] = useState<string | null>(null);
  const [firmaClienteUrl, setFirmaClienteUrl] = useState<string | null>(null);


  useEffect(() => {
    let isMounted = true;

    const cargarFirmas = async () => {
      if (!bitacora) return;

      try {
        if (bitacora.firmaTecnico_id) {
          const res = await fetch(`/api/firmas/${bitacora.firmaTecnico_id}`);
          const data = await res.json();
          const base64 = data.results?.[0]?.firma_base64;
          if (isMounted && base64) setFirmaTecnicoImg(base64);
        }

        if (bitacora.firmaCLiente_id) {
          const res = await fetch(`/api/firmas/${bitacora.firmaCLiente_id}`);
          const data = await res.json();
          const base64 = data.results?.[0]?.firma_base64;
          const url = data.results?.[0]?.url;

          if (isMounted) {
            if (base64 && base64.trim() !== "") {
              setFirmaClienteImg(base64);
              setFirmaClienteUrl(null);
            } else if (url) {
              setFirmaClienteImg(null);
              setFirmaClienteUrl(url);
            }
          }
        }
      } catch (error) {
        console.error("Error cargando firmas:", error);
      }
    };

    if (isOpen && bitacora) {
      setFirmaTecnicoImg(null);
      setFirmaClienteImg(null);
      cargarFirmas();
    }

    return () => {
      isMounted = false;
    };
  }, [bitacora, isOpen]);

  if (!isOpen || !bitacora) return null;

  const sistemaNombre = sistemas.find((s) => s.id === bitacora.sistema_id)?.sistema || "";
  const equipoNombre = equipos.find((e) => e.id === bitacora.equipo_id)?.equipo || "";
  const tipoServicioNombre = tipo_servicio.find((t) => t.id === bitacora.tipo_servicio_id)?.tipo_servicio || "";
  const faseImplementacionNombre = fase_implementacion.find((f) => f.id === bitacora.fase_implementacion_id)?.fase || "";

  const campos = [
    { label: "Ticket", value: bitacora.no_ticket },
    {
      label: "Fecha del Servicio",
      value: new Date(bitacora.fecha_servicio).toLocaleDateString("es-HN", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
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
    { label: "Horas Consumidas", value: bitacora.horas_consumidas },
    { label: "Tipo de Horas", value: bitacora.tipo_horas },
    { label: "Responsable", value: bitacora.responsable },
    { label: "Tipo de Servicio", value: tipoServicioNombre},
    ...(sistemaNombre ? [{ label: "Sistema", value: sistemaNombre }] : []),
    ...(equipoNombre ? [{ label: "Equipo", value: equipoNombre }] : []),
    { label: "Modalidad", value: bitacora.modalidad },
    ...(bitacora.nombres_capacitados
      ? [{ label: "Nombres Capacitados", value: bitacora.nombres_capacitados }]
      : []),
    { label: "Fase de Implementación", value: faseImplementacionNombre },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center sm:text-left">
          Detalle de Bitácora
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-gray-700 text-sm sm:text-base">
          {campos.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="font-semibold text-gray-800">{label}:</span>
              <span className="mt-1 whitespace-pre-wrap">{value}</span>
            </div>
          ))}

          <div className="sm:col-span-2 mt-4">
            <span className="font-semibold text-gray-800">Descripción:</span>
            <p className="mt-1 whitespace-pre-wrap text-gray-700">{bitacora.descripcion_servicio}</p>
          </div>

          {bitacora.comentarios && (
            <div className="sm:col-span-2 mt-4">
              <span className="font-semibold text-gray-800">Comentarios:</span>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">{bitacora.comentarios}</p>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-800 mb-2">Firma del Técnico</span>
          {firmaTecnicoImg ? (
            <img
              src={firmaTecnicoImg}
              alt="Firma técnico"
              className="border-b border-gray-400 max-w-xs w-full object-contain"
            />
          ) : (
            <span className="text-red-600">Firma pendiente</span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-800 mb-2">Firma del Cliente</span>
          {firmaClienteImg ? (
            <img
              src={firmaClienteImg}
              alt="Firma cliente"
              className="border-b border-gray-400 max-w-xs w-full object-contain"
            />
          ) : firmaClienteUrl ? (
            <div className="text-center">
              <span className="text-red-600 font-semibold block mb-2">⚠️PENDIENTE</span>
              <p className="text-sm text-gray-700 mb-2">El cliente aún no ha firmado.</p>
              <button
                className="text-blue-600 underline hover:text-blue-800 text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(firmaClienteUrl);
                  alert("ENLACE COPIADO");
                }}
              >
                Copiar enlace de firma
              </button>
            </div>
          ) : (
            <span className="text-red-600">⚠️ pendiente</span>
          )}

        </div>
      </div>


        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
