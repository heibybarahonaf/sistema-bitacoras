"use client";

import Swal from "sweetalert2";
import ModalPago from "@/components/ModalPago";
import { Pagos_Cliente } from "@prisma/client";
import { DollarSign, Eye, Edit } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface PagoConCliente extends Pagos_Cliente {
  cliente: {
    id: number;
    responsable: string;
    empresa: string;
    rtn: string;
    direccion: string;
    telefono: string;
    correo: string;
    activo: boolean;
    horas_paquetes: number;
    horas_individuales: number;
    monto_paquetes: number;
    monto_individuales: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

function mostrarDetallePago(pago: PagoConCliente) {
  Swal.fire({
    title: "Detalle de Pago",
    html: `
      <strong>Factura:</strong> ${pago.no_factura} <br/><br/>
      <strong>Cliente:</strong> ${pago.cliente?.empresa || pago.cliente?.responsable} <br/><br/>
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
  const [pagosPorPagina] = useState(10);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [metaPagos, setMetaPagos] = useState({total: 0, page: 1, limit: 10, totalPages: 0});

  const [pagos, setPagos] = useState<PagoConCliente[]>([]);
  const [modalPago, setModalPago] = useState<{ open: boolean; pago?: PagoConCliente }>({
    open: false,
  });

  // Filtros
  const [fechaFin, setFechaFin] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [filtroFactura, setFiltroFactura] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  const fetchPagos = useCallback(async () => {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        limit: pagosPorPagina.toString(),
        ...(filtroFactura && { factura: filtroFactura }),
        ...(filtroCliente && { cliente: filtroCliente }),
        ...(fechaInicio && { fechaInicio }),
        ...(fechaFin && { fechaFin }),
      });

      const res = await fetch(`/api/pagos?${params}`);
      const response = await res.json();

      if (response.code === 404) {
        setPagos([]);
        setShowEmptyMessage(true);
        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar pagos");
      }

      setPagos(response.results || []);
      setMetaPagos(
        response.meta || {
          total: 0,
          page: paginaActual,
          limit: 10,
          totalPages: 0,
        }
      );

      if (response.results?.length === 0) setShowEmptyMessage(true);

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
  }, [paginaActual, pagosPorPagina, filtroFactura, filtroCliente, fechaInicio, fechaFin]);
  
  useEffect(() => {
    fetchPagos();
  }, [fetchPagos, paginaActual, filtroFactura]);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= metaPagos.totalPages) {
      setPaginaActual(nuevaPagina);
    }
  };


  return (
    <div className="p-6 bg-white min-h-screen mb-8">
      <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <DollarSign className="w-8 h-8 text-[#295d0c]" />
        Pagos Registrados
      </h1>

      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row text-sm md:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 whitespace-nowrap">Desde:</span>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 whitespace-nowrap">Hasta:</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <input
          type="text"
          placeholder="Buscar factura..."
          value={filtroFactura}
          onChange={(e) => setFiltroFactura(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
        />

        <input
          type="text"
          placeholder="Buscar cliente..."
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
        />

        {(fechaInicio || fechaFin || filtroFactura || filtroCliente) && (
          <button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
              setFiltroFactura("");
              setFiltroCliente("");
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
      ) : pagos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💵</div>
          <p className="text-gray-600 text-lg">No hay pagos registrados.</p>
        </div>
      ) : (
        <div className="">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left">Factura</th>
                <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">Cliente</th>
                <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">Forma de pago</th>
                <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">Detalle</th>
                <th className="px-2 sm:px-4 py-3 text-left ">Monto</th>
                <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">Horas</th>
                <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">Tipo</th>
                <th className="px-2 sm:px-4 py-3 text-left">Fecha</th>
                <th className="px-2 sm:px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3">{pago.no_factura}</td>
                  <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                    {pago.cliente?.empresa || pago.cliente?.responsable}
                  </td>
                  <td className="px-2 sm:px-4 py-3 hidden md:table-cell">{pago.forma_pago}</td>
                  <td className="px-2 sm:px-4 py-3 hidden md:table-cell">{pago.detalle_pago}</td>
                  <td className="px-2 sm:px-4 py-3">L.{pago.monto}</td>
                  <td className="px-2 sm:px-4 py-3 hidden md:table-cell">{pago.cant_horas}</td>
                  <td className="px-2 sm:px-4 py-3 hidden md:table-cell">{pago.tipo_horas}</td>
                  <td className="px-2 sm:px-4 py-3">{new Date(pago.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => mostrarDetallePago(pago)}
                        className="mr-2 text-[#295d0c] hover:text-[#173a01]"
                        title="Ver detalles"
                      >
                        <Eye size={22} />
                      </button>
                      <button
                        onClick={() => setModalPago({ open: true, pago })}
                        className="text-[#2e3763] hover:text-[#171f40]"
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

          {/* Paginación */}
          {pagos.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row text-xs justify-between items-center gap-4">
              <div className="text-gray-600">
                Mostrando {pagos.length} de {metaPagos.total} pagos
              </div>
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => cambiarPagina(1)}
                  disabled={metaPagos.page === 1}
                  className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Primera
                </button>
                <button
                  onClick={() => cambiarPagina(metaPagos.page - 1)}
                  disabled={metaPagos.page === 1}
                  className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 bg-[#295d0c] text-white rounded font-medium">{metaPagos.page}</span>
                <button
                  onClick={() => cambiarPagina(metaPagos.page + 1)}
                  disabled={metaPagos.page === metaPagos.totalPages}
                  className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => cambiarPagina(metaPagos.totalPages)}
                  disabled={metaPagos.page === metaPagos.totalPages}
                  className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Última
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de edición */}
      {modalPago.open && modalPago.pago && (
        <ModalPago
          clienteId={modalPago.pago.cliente.id}
          pago={modalPago.pago}
          onClose={() => setModalPago({ open: false })}
          onGuardar={fetchPagos}
        />
      )}
    </div>
  );
}
