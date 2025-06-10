"use client";
import React, { useState } from "react";
import { ClienteInfo } from "./ClienteInfo";
import { BitacorasTabla } from "./BitacorasTabla";
import { BuscadorClientes } from "@/components/BuscadorClientes";

export default function ClienteDetalle() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [mostrarBuscador, setMostrarBuscador] = useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* Botón para mostrar el buscador */}
      <button
        onClick={() => setMostrarBuscador((prev) => !prev)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {mostrarBuscador ? "Cerrar búsqueda" : "Buscar cliente"}
      </button>

      {mostrarBuscador && (
        <BuscadorClientes onSelect={(cliente) => {
          setClienteSeleccionado(cliente);
          setMostrarBuscador(false);
        }} />
      )}

      {/* Información del cliente */}
      <ClienteInfo cliente={clienteSeleccionado} />

      {/* Tabla de bitácoras (puedes pasar cliente.id si quieres filtrar) */}
      <BitacorasTabla clienteId={clienteSeleccionado?.id} />
    </div>
  );
}

