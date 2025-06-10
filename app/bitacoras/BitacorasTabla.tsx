"use client";

import React, { useState } from "react";
import { FaDownload, FaEye } from "react-icons/fa";
import { ModalBitacora } from "@/components/ModalBitacora";

// 👇 AÑADIR props
type Props = {
  clienteId?: number;
};

export function BitacorasTabla({ clienteId }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const bitacoras = [
    // datos simulados o fetch por clienteId
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex justify-between mb-2">
        <h2 className="font-bold text-lg">
          Bitácoras {clienteId ? `(Cliente ID: ${clienteId})` : ""}
        </h2>
        <div className="space-x-2">
          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded"
            onClick={() => setModalAbierto(true)}
          >
            Nuevo
          </button>
          <button className="bg-purple-600 text-white px-3 py-1 rounded">
            Pago
          </button>
        </div>
      </div>

      {/* Aquí iría tu tabla filtrada por clienteId */}

      {/* Modal */}
      {modalAbierto && (
        <ModalBitacora
          onClose={() => setModalAbierto(false)}
          //clienteId={clienteId}
        />
      )}
    </div>
  );
}
