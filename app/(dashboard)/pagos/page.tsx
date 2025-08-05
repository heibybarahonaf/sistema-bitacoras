"use client";

import Swal from "sweetalert2";
import ModalPago from "@/components/ModalPago";
import { Pagos_Cliente } from "@prisma/client";
import { DollarSign, Eye, Edit } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaginationButtons from "@/components/PaginationButtons";
import { TableHeader, TableCell } from "@/components/TableComponents";

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
    usuario_id: number;
    horas_paquetes: number;
    horas_individuales: number;
    monto_paquetes: number;
    monto_individuales: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

async function mostrarDetallePago(pago: PagoConCliente) {
  let usuario = "";

    try {
      const res = await fetch(`/api/usuarios/${pago.usuario_id}`);
      const usuarioData = await res.json();

      if (usuarioData.results.length > 0) {
        usuario = usuarioData.results[0].nombre;
      }

    } catch {

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al cargar el técnico",
      });

    }

  Swal.fire({
    title: "Detalle de Pago",
    html: `
      <p style="margin-bottom: 4px;"><strong>Factura:</strong> ${pago.no_factura}</p>
      <p style="margin-bottom: 4px;"><strong>Cliente:</strong> ${pago.cliente?.empresa || pago.cliente?.responsable}</p>
      <p style="margin-bottom: 4px;"><strong>Técnico:</strong> ${usuario}</p>
      <p style="margin-bottom: 4px;"><strong>Forma de pago:</strong> ${pago.forma_pago}</p>
      <p style="margin-bottom: 4px;"><strong>Detalle:</strong> ${pago.detalle_pago}</p>
      <p style="margin-bottom: 4px;"><strong>Monto:</strong> L.${pago.monto}</p>
      <p style="margin-bottom: 4px;"><strong>Cantidad de horas:</strong> ${pago.cant_horas}</p>
      <p style="margin-bottom: 4px;"><strong>Tipo de horas:</strong> ${pago.tipo_horas}</p>
      <p style="margin-bottom: 4px;"><strong>Fecha de pago:</strong> ${new Date(pago.createdAt).toLocaleString("es-HN")}</p>
    `,
    icon: "info",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#295d0c",
  });
}

export default function PagosPage() {
  const [pagosPorPagina] = useState(10);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [metaPagos, setMetaPagos] = useState({total: 0, page: 1, limit: 10, totalPages: 0});

  const [pagos, setPagos] = useState<PagoConCliente[]>([]);
  const [modalPago, setModalPago] = useState<{ open: boolean; pago?: PagoConCliente }>({ open: false });

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


  const formatearFecha = (fecha: string) => {
    if (!fecha) return "";
    const d = new Date(fecha);

    if (isNaN(d.getTime())) return "Fecha inválida";

    const dia = d.getUTCDate().toString().padStart(2, "0");
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const año = d.getUTCFullYear();

    return `${dia}/${mes}/${año}`;
};

  return (
    <div className="w-full p-6 pb-20 min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-emerald-700" />
          Pagos Registrados
        </h1>
        <div className="border-b border-gray-200"></div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Desde:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 text.xs"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Hasta:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border border-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Buscar factura:</label>
          <input
            type="text"
            placeholder="Número de factura"
            value={filtroFactura}
            onChange={(e) => setFiltroFactura(e.target.value)}
            className="border border-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700 mb-1">Buscar cliente:</label>
          <input
            type="text"
            placeholder="Nombre de cliente"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="border border-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {(fechaInicio || fechaFin || filtroFactura || filtroCliente) && (
        <div className="mb-6">
          <button
            onClick={() => {
              setFechaInicio("");
              setFechaFin("");
              setFiltroFactura("");
              setFiltroCliente("");
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Tabla de pagos */}
      {loading ? (
        <LoadingSpinner mensaje="Cargando pagos..."/>
      ) : pagos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">💵</div>
          <p className="text-gray-600 text-lg">No hay pagos registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Factura</TableHeader>
                  <TableHeader className="hidden md:table-cell">Cliente</TableHeader>
                  <TableHeader className="hidden md:table-cell">Forma de pago</TableHeader>
                  <TableHeader className="hidden md:table-cell">Detalle</TableHeader>
                  <TableHeader>Monto</TableHeader>
                  <TableHeader className="hidden md:table-cell">Horas</TableHeader>
                  <TableHeader className="hidden md:table-cell">Tipo</TableHeader>
                  <TableHeader>Fecha</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{pago.no_factura}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {pago.cliente?.empresa || pago.cliente?.responsable}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{pago.forma_pago}</TableCell>
                    <TableCell className="hidden md:table-cell">{pago.detalle_pago}</TableCell>
                    <TableCell>L.{pago.monto}</TableCell>
                    <TableCell className="hidden md:table-cell">{pago.cant_horas}</TableCell>
                    <TableCell className="hidden md:table-cell">{pago.tipo_horas}</TableCell>
                    <TableCell>
                      {new Date(pago.createdAt).toLocaleDateString("es-HN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => mostrarDetallePago(pago)}
                          className="text-gray-600 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-emerald-50"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setModalPago({ open: true, pago })}
                          className="text-gray-600 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>

              {/* Pie de tabla con paginación */}
              {metaPagos.totalPages > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={9} className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-gray-600">
                          Página {metaPagos.page} de {metaPagos.totalPages} ({metaPagos.total} total)
                        </div>
                        <div className="flex space-x-1">
                          <PaginationButtons
                            currentPage={metaPagos.page}
                            totalPages={metaPagos.totalPages}
                            onPageChange={setPaginaActual}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
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
