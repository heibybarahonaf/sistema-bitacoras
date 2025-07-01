"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { DollarSign, Eye, Edit } from "lucide-react";
import ModalPago from "@/components/ModalPago"; 

interface Pago {
  id: number;
  cliente_id: number;
  no_factura: string;
  forma_pago: string;
  detalle_pago: string;
  monto: number;
  tipo_horas: string;
  cant_horas: number;
  createdAt: string;
  updatedAt: string;
}

function mostrarDetallePago(pago: Pago) {
  Swal.fire({
    title: "Detalle de Pago",
    html: `
      <strong>Factura:</strong> ${pago.no_factura} <br/><br/>
      <strong>Forma de pago:</strong> ${pago.forma_pago} <br/><br/>
      <strong>Detalle:</strong> ${pago.detalle_pago} <br/><br/>
      <strong>Monto:</strong> L.${pago.monto} <br/><br/>
      <strong>Cantidad de horas:</strong> ${pago.cant_horas} <br/><br/>
      <strong>Tipo de horas:</strong> ${pago.tipo_horas} <br/><br/>
      <strong>Fecha de pago:</strong> ${new Date(pago.createdAt).toLocaleString()}
    `,
    icon: "info",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#295d0c",
  });
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#295d0c] rounded-full animate-spin" />
    <p className="mt-4 text-gray-600 font-medium">Cargando pagos...</p>
  </div>
);

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  const [modalPago, setModalPago] = useState<{ open: boolean; pago?: Pago }>({
    open: false,
  });

  // Filtros
  const [filtroFactura, setFiltroFactura] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    fetchPagos();
  }, []);

  async function fetchPagos() {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const res = await fetch("/api/pagos");
      const response = await res.json();

      if (response.code === 404) {
        setPagos([]);
        setShowEmptyMessage(true);
        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar pagos");
      }

      const pagosPlanos = response.results?.[0] || [];
      setPagos(pagosPlanos);
      if (pagosPlanos.length === 0) setShowEmptyMessage(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar pagos",
        text: error instanceof Error ? error.message : "Error inesperado",
        confirmButtonColor: "#295d0c",
      });
    } finally {
      setLoading(false);
    }
  }

  const pagosFiltrados = pagos.filter((pago) => {
    const fechaPagoStr = pago.createdAt.split("T")[0];
    const inicioStr = fechaInicio ? new Date(fechaInicio).toISOString().split("T")[0] : null;
    const finStr = fechaFin ? new Date(fechaFin).toISOString().split("T")[0] : null;

    const cumpleFecha =
      (!inicioStr || fechaPagoStr >= inicioStr) &&
      (!finStr || fechaPagoStr <= finStr);

    const cumpleFactura =
      !filtroFactura || pago.no_factura.toLowerCase().includes(filtroFactura.toLowerCase());

    return cumpleFecha && cumpleFactura;
  });

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <DollarSign className="w-8 h-8 text-[#295d0c]" />
        Pagos Registrados
      </h1>

      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Buscar factura..."
          value={filtroFactura}
          onChange={(e) => setFiltroFactura(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
        />
        {(fechaInicio || fechaFin || filtroFactura) && (
          <button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
              setFiltroFactura("");
            }}
            className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla de pagos */}
      {loading ? (
        <LoadingSpinner />
      ) : pagosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💵</div>
          <p className="text-gray-600 text-lg">No hay pagos registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Factura</th>
                <th className="px-4 py-3 border-b text-left">Forma de pago</th>
                <th className="px-4 py-3 border-b text-left">Detalle</th>
                <th className="px-4 py-3 border-b text-left">Monto</th>
                <th className="px-4 py-3 border-b text-left">Horas</th>
                <th className="px-4 py-3 border-b text-left">Tipo</th>
                <th className="px-4 py-3 border-b text-left">Fecha</th>
                <th className="px-4 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{pago.no_factura}</td>
                  <td className="px-4 py-3 border-b">{pago.forma_pago}</td>
                  <td className="px-4 py-3 border-b">{pago.detalle_pago}</td>
                  <td className="px-4 py-3 border-b">L.{pago.monto}</td>
                  <td className="px-4 py-3 border-b">{pago.cant_horas}</td>
                  <td className="px-4 py-3 border-b">{pago.tipo_horas}</td>
                  <td className="px-4 py-3 border-b">
                    {new Date(pago.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => mostrarDetallePago(pago)}
                        className="flex items-center px-2 py-1 bg-[#2e3763] text-white rounded hover:bg-[#252a50]"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setModalPago({ open: true, pago })}
                        className="flex items-center px-2 py-1 bg-[#4d152c] text-white rounded hover:bg-[#3e1024]"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {modalPago.open && modalPago.pago && (
        <ModalPago
          clienteId={modalPago.pago.cliente_id}
          pago={modalPago.pago}
          onClose={() => setModalPago({ open: false })}
          onGuardar={fetchPagos}
        />
      )}
    </div>
  );
}
