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

interface ModalDetalleBitacoraProps {
  isOpen: boolean;
  onClose: () => void;
  bitacora: any | null;
  sistemas: Sistema[];
  equipos: Equipo[];
}

export default function ModalDetalleBitacora({
  isOpen,
  onClose,
  bitacora,
  sistemas,
  equipos,
}: ModalDetalleBitacoraProps) {
  const [firmaTecnicoImg, setFirmaTecnicoImg] = useState<string | null>(null);
  const [firmaClienteImg, setFirmaClienteImg] = useState<string | null>(null);

  useEffect(() => {
  let isMounted = true;

  const cargarFirmas = async () => {
    if (!bitacora) return;
    if (bitacora.firmaTecnico_id) {
      const res = await fetch(`/api/firmas/${bitacora.firmaTecnico_id}`);
      const data = await res.json();
      const base64 = data.results?.[0]?.firma_base64;
      if (base64 && isMounted) setFirmaTecnicoImg(base64);
    }

    if (bitacora.firmaCLiente_id) {
      const res = await fetch(`/api/firmas/${bitacora.firmaCLiente_id}`);
      const data = await res.json();
      const base64 = data.results?.[0]?.firma_base64;
      if (base64 && isMounted) setFirmaClienteImg(base64);
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

  const campos = [
    { label: "Ticket", value: bitacora.no_ticket },
    { label: "Fecha del Servicio", value: new Date(bitacora.fecha_servicio).toLocaleDateString() },
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
    { label: "Tipo de Servicio", value: bitacora.tipo_servicio },
    {
      label: "Sistema",
      value: sistemas.find((s) => s.id === bitacora.sistema_id)?.sistema || "-",
    },
    {
      label: "Equipo",
      value: equipos.find((e) => e.id === bitacora.equipo_id)?.equipo || "-",
    },
    { label: "Modalidad", value: bitacora.modalidad },
    { label: "Nombres Capacitados", value: bitacora.nombres_capacitados },
    { label: "Fase de Implementación", value: bitacora.fase_implementacion },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Detalle de Bitácora</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          {campos.map(({ label, value }) => (
            <div key={label}>
              <strong>{label}:</strong> {value}
            </div>
          ))}

          <div className="sm:col-span-2">
            <strong>Descripción:</strong>
            <p className="mt-1 whitespace-pre-line">{bitacora.descripcion_servicio}</p>
          </div>

          {bitacora.comentarios && (
            <div className="sm:col-span-2">
              <strong>Comentarios:</strong>
              <p className="mt-1 whitespace-pre-line">{bitacora.comentarios}</p>
            </div>
          )}
        </div>

        {(firmaTecnicoImg || firmaClienteImg) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {firmaTecnicoImg && (
              <div>
                <strong>Firma del Técnico:</strong>
                <img
                  src={`${firmaTecnicoImg}`}
                  alt="Firma técnico"
                  className="border rounded mt-1 w-full max-w-xs"
                />
              </div>
            )}
            {firmaClienteImg && (
              <div>
                <strong>Firma del Cliente:</strong>
                <img
                  src={`${firmaClienteImg}`}
                  alt="Firma cliente"
                  className="border rounded mt-1 w-full max-w-xs"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#295d0c] text-white rounded hover:bg-[#23480a] font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

