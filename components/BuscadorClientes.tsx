"use client";

import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";
import ModalPago from "@/components/ModalPago";
import FormNuevaBitacora from "@/components/ModalBitacora";
import PaginationButtons from "@/components/PaginationButtons";
import React, { useEffect, useState, useCallback } from "react";
import { Eye, Notebook, Download, ChevronLeft, Trash2  } from "lucide-react";
import ModalDetalleBitacora from "@/components/ModalDetalleBitacora";
import { TableHeader, TableCell } from "@/components/TableComponents";
import { Bitacora, Cliente, Sistema, Equipo, Tipo_Servicio, Fase_Implementacion } from "@prisma/client";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BitacoraConRelaciones extends Bitacora {
  firmaCliente?: {
    firma_base64?: string;
    url?: string;
  };
  sistema?: {
    sistema: string;
  } | null;
  equipo?: {
    equipo: string;
  } | null;
  tipo_servicio?: {
    tipo_servicio: string;
  } | null;
  fase_implementacion?: {
    fase: string;
  } | null;
}

const BuscarCliente: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [bitacoras, setBitacoras] = useState<BitacoraConRelaciones[]>([]);
  const [tipo_servicio, setTipoServicio] = useState<Tipo_Servicio[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [bitacoraSeleccionada, setBitacoraSeleccionada] = useState<BitacoraConRelaciones | null>(null);
  const [fase_implementacion, setFaseImplementacion] = useState<Fase_Implementacion[]>([]);

  const [showPago, setShowPago] = useState(false);
  const [intervaloActivo, setIntervaloActivo] = useState(false);
  const [showNewBitacora, setShowNewBitacora] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);

  const [filtro, setFiltro] = useState("");
  const [filtroActual, setFiltroActual] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");

  const [paginaActualClientes, setPaginaActualClientes] = useState(1);
  const [paginaActualBitacoras, setPaginaActualBitacoras] = useState(1);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [isDelete, setIsDelete] = useState<number | null>(null);
  const [metaClientes, setMetaClientes] = useState<PaginationMeta>({total: 0, page: 1, limit: 10, totalPages: 0});
  const [metaBitacoras, setMetaBitacoras] = useState<PaginationMeta>({total: 0, page: 1, limit: 10, totalPages: 0 });
  const formatoLempiras = (valor: number) => valor.toLocaleString("es-HN", { style: "currency", currency: "HNL" });

  const mostrarDetalleBitacora = async (bitacora: Bitacora) => {

    try {

      await cargarDatosComunes();
      setBitacoraSeleccionada(bitacora);
      setModalDetalleOpen(true);

    } catch {

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al cargar detalles",
      });

    }
  };

  const cargarDatosComunes = async () => {

    try {

      const [resServicio, resFases, resSistemas, resEquipos] =
        await Promise.all([
          fetch("/api/tipo-servicio"),
          fetch("/api/fase-implementacion"),
          fetch("/api/sistemas/activos"),
          fetch("/api/equipos/activos"),
        ]);

      const dataServicios = await resServicio.json();
      const dataFases = await resFases.json();
      const dataSistemas = await resSistemas.json();
      const dataEquipos = await resEquipos.json();

      setTipoServicio(dataServicios.results || []);
      setFaseImplementacion(dataFases.results || []);
      setSistemas(dataSistemas.results || []);
      setEquipos(dataEquipos.results || []);

    } catch {

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al cargar los datos para crear bitacora",
      });

    }
  };

  const fetchClientes = useCallback(async () => {

    try {

      const params = new URLSearchParams({
        page: paginaActualClientes.toString(),
        limit: metaClientes.limit.toString(),
        ...(filtroActual && { search: filtroActual }),
      });

      const res = await fetch(`/api/clientes?${params}`);
      const response = await res.json();

      if (response.code === 404) {
        setClientes([]);
        setMetaClientes({
          total: 0,
          page: paginaActualClientes,
          limit: metaClientes.limit,
          totalPages: 0,
        });

        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar clientes");
      }

      setClientes(response.results ?? []);

      if (response.meta) {
        setMetaClientes(response.meta);
      }

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error al cargar clientes",
        text:
          error instanceof Error
            ? error.message
            : "Error inesperado al cargar los clientes",
        confirmButtonColor: "#295d0c",
      });
    }

  }, [paginaActualClientes, filtroActual, metaClientes.limit]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes, paginaActualClientes, filtroActual]);

  const cargarBitacoras = useCallback(
    async (clienteId: number, page: number = 1) => {
      setLoadingBitacoras(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: metaBitacoras.limit.toString(),
          ...(filtroEstado !== "todas" && { estado: filtroEstado }),
        });

        const res = await fetch(
          `/api/bitacoras/cliente/${clienteId}?${params}`
        );

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();

        if (data.code === 200) {
          setBitacoras(data.results || []);
          setMetaBitacoras(
            data.meta || {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            }
          );
        }

      } catch (error) {

        Swal.fire({
          icon: "error",
          title: "Error al cargar bitacoras",
          text:
            error instanceof Error
              ? error.message
              : "Error inesperado al cargar las bitacoras",
          confirmButtonColor: "#295d0c",
        });

        setBitacoras([]);
      } finally {
        setLoadingBitacoras(false);
      }
    },
    [filtroEstado, metaBitacoras.limit]
  );

  const cargarClientePorId = async (clienteId: number) => {

    try {

      const res = await fetch(`/api/clientes/${clienteId}`);
      const data = await res.json();
      if (data.code === 200 && data.results?.length > 0) {
        setClienteSeleccionado(data.results[0]);
      }

    } catch {

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al recargar cliente",
      });

    }
  };

  useEffect(() => {
    setPaginaActualClientes(1);
  }, [filtro]);

  useEffect(() => {
    if (clienteSeleccionado?.id) {
      cargarBitacoras(clienteSeleccionado.id, paginaActualBitacoras);
    }
  }, [cargarBitacoras, clienteSeleccionado, paginaActualBitacoras, filtroEstado]);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.empresa.toLowerCase().includes(filtro.toLowerCase()) ||
      c.rtn.includes(filtro)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filtro !== filtroActual) {
        setFiltroActual(filtro);
        setPaginaActualClientes(1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [filtro, filtroActual]);

  useEffect(() => {
    setIntervaloActivo(false); 

    if (clienteSeleccionado?.id) {
      cargarBitacoras(clienteSeleccionado.id);
    }
  }, [clienteSeleccionado?.id]);

  useEffect(() => {
    return () => {
      setIntervaloActivo(false);
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (clienteSeleccionado?.id && intervaloActivo) {
      intervalId = setInterval(async () => {
        try {
          const params = new URLSearchParams({
            page: paginaActualBitacoras.toString(),
            limit: metaBitacoras.limit.toString(),
            ...(filtroEstado !== "todas" && { estado: filtroEstado }),
          });

          const res = await fetch(`/api/bitacoras/cliente/${clienteSeleccionado.id}?${params}`);
          const data = await res.json();

          if (data.code === 200) {
            const nuevas = data.results || [];
            const haCambiado = JSON.stringify(nuevas) !== JSON.stringify(bitacoras);

            if (haCambiado) {
              setBitacoras(nuevas);
              setMetaBitacoras(data.meta || metaBitacoras);
            }
          }
        } catch {

          /*Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Error al cargar firmas",
          });*/

        }
      }, 60000); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [metaBitacoras,clienteSeleccionado?.id, paginaActualBitacoras, filtroEstado, bitacoras, intervaloActivo]);

  const mostrarAlertaError = (mensaje: string) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje,
      confirmButtonColor: "#dc2626",
    });
  };

  const mostrarAlertaExito = (mensaje: string) => {
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: mensaje,
      confirmButtonColor: "#16a34a",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  const handleDownload = async (bitacoraId: number) => {
    setIsDownloading(bitacoraId);

    try {
      const res = await fetch(`/api/bitacoras/${bitacoraId}/reporte-firmas`);

      if (!res.ok) {
        const text = await res.text();
        let mensaje = "Error al generar el PDF";

        try {
          const data = JSON.parse(text);
          mensaje = data.message || mensaje;
        } catch {}

        mostrarAlertaError(mensaje);
        return;
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        mostrarAlertaError("El PDF generado está vacío");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bitacora-${bitacoraId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      mostrarAlertaExito("PDF descargado exitosamente");
    } catch {
      mostrarAlertaError("Error de conexión al generar el PDF");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleEliminar = async (bitacoraId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;    
    setIsDelete(bitacoraId);

    try {
      const res = await fetch(`/api/bitacoras/${bitacoraId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.code !== 200) {
        mostrarAlertaError(data.message || "Error al eliminar la bitácora");

        return;
      }

      mostrarAlertaExito("Bítacora eliminada con exito!");
      if (clienteSeleccionado?.id) {
      await Promise.all([
        cargarBitacoras(clienteSeleccionado.id, paginaActualBitacoras),
        cargarClientePorId(clienteSeleccionado.id)
      ]);
    }
    } catch {
      mostrarAlertaError("Error de conexión al eliminar la bitácora");
    } finally {
      setIsDelete(null);
    }
  };


  const handleNuevaBitacora = async () => {

    try {

      await cargarDatosComunes();
      setShowNewBitacora(true);

    } catch {

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error al cargar datos",
      });

    }
  };

  const bitacorasMostrar = bitacoras;

  return (
    <>
      <div className="w-full p-6 pb-20 min-h-screen bg-gray-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-2">
            <Notebook className="w-6 h-6 text-emerald-700" />
            Gestión de Bitácoras
          </h1>
          <div className="border-b border-gray-200"></div>
        </div>

        {/* Búsqueda de clientes */}
        <section className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Buscar Cliente</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por Empresa o RTN"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-sm"
              />
            </div>
          </div>

          {/* Lista de clientes */}
          {clientes.length > 0 && !clienteSeleccionado && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RTN
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientes.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {c.empresa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.rtn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setClienteSeleccionado(c)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-1 rounded-full hover:bg-emerald-50"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Paginación */}
                  {metaClientes.totalPages > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-xs text-gray-600">
                              Página {metaClientes.page} de {metaClientes.totalPages} ({metaClientes.total} total)
                            </div>
                            <div className="flex space-x-1">
                              <PaginationButtons
                                currentPage={metaClientes.page}
                                totalPages={metaClientes.totalPages}
                                onPageChange={setPaginaActualClientes}
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
        </section>

        {/* Detalle de cliente seleccionado */}
        {clienteSeleccionado && (
          <section>
            <button
              onClick={() => {
                setClienteSeleccionado(null);
                setFiltro("");
                setIntervaloActivo(false);
              }}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Volver a búsqueda
            </button>

            {/* Información del cliente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Datos del Cliente
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><span className="font-medium">Empresa:</span> {clienteSeleccionado.empresa}</li>
                    <li><span className="font-medium">Responsable:</span> {clienteSeleccionado.responsable}</li>
                    <li><span className="font-medium">RTN:</span> {clienteSeleccionado.rtn}</li>
                    <li><span className="font-medium">Zona:</span> {clienteSeleccionado.direccion}</li>
                    <li><span className="font-medium">Teléfono:</span> {clienteSeleccionado.telefono}</li>
                    <li><span className="font-medium">Correo:</span> {clienteSeleccionado.correo || "N/A"}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Horas | Saldos
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <span className="font-medium">Paquetes:</span> {clienteSeleccionado.horas_paquetes} | {formatoLempiras(clienteSeleccionado.monto_paquetes)}
                    </li>
                    <li>
                      <span className="font-medium">Individuales:</span> {clienteSeleccionado.horas_individuales} | {formatoLempiras(clienteSeleccionado.monto_individuales)}
                    </li>
                    <li className="pt-4 mt-4 border-t border-gray-200 font-medium">
                      <span className="font-medium">Total:</span> {clienteSeleccionado.horas_paquetes + clienteSeleccionado.horas_individuales} | {formatoLempiras(clienteSeleccionado.monto_paquetes + clienteSeleccionado.monto_individuales)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bitácoras del cliente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <h3 className="text-lg font-medium text-gray-800 whitespace-nowrap">Bitácoras</h3>
                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setPaginaActualBitacoras(1);
                    }}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition min-w-[120px]"
                  >
                    <option value="todas">Todas</option>
                    <option value="pendientes">Pendientes</option>
                    <option value="firmadas">Firmadas</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => {
                      cargarClientePorId(clienteSeleccionado.id);
                      cargarBitacoras(clienteSeleccionado.id, paginaActualBitacoras);
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </button>
                  <button
                    onClick={handleNuevaBitacora}
                    className="px-3 py-1.5 bg-[#2e3763] text-white rounded-md text-sm hover:bg-[#252a50] transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Bitácora
                  </button>
                  <button
                    onClick={() => setShowPago(true)}
                    className="px-3 py-1.5 bg-rose-800 text-white rounded-md text-sm hover:bg-rose-900 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Registrar Pago
                  </button>
                </div>
              </div>

              {loadingBitacoras ? (
                <LoadingSpinner mensaje="Cargando bitácoras..."/>
              ) : bitacoras.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Este cliente no tiene bitácoras registradas.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <TableHeader>Ticket</TableHeader>
                          <TableHeader>Fecha</TableHeader>
                          <TableHeader className="hidden md:table-cell">Horas</TableHeader>
                          <TableHeader className="hidden xl:table-cell">Descripción</TableHeader>
                          <TableHeader>Estado</TableHeader>
                          <TableHeader>Acciones</TableHeader>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        
                        {bitacoras.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>{b.no_ticket}</TableCell>
                            <TableCell>
                              {new Date(b.fecha_servicio).toLocaleDateString("es-HN", {
                                timeZone: "UTC",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {b.horas_consumidas} ({b.tipo_horas})
                            </TableCell>
                            <TableCell className="hidden xl:table-cell truncate max-w-xs" title={b.descripcion_servicio}>
                              {b.descripcion_servicio}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                b.firmaCliente?.firma_base64 && b.firmaCliente.firma_base64.trim() !== ''
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {b.firmaCliente?.firma_base64 ? "Firmada" : "Pendiente"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="justify-center gap-2">
                                <button
                                  onClick={() => mostrarDetalleBitacora(b)}
                                  className="text-gray-600 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-emerald-50"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDownload(b.id)}
                                  disabled={isDownloading === b.id}
                                  className={`text-gray-600 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50 ${
                                    isDownloading === b.id ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  title="Descargar PDF"
                                >
                                  <Download className="w-5 h-5" />
                                </button>

                                <button
                                  onClick={() => handleEliminar(b.id)}
                                  disabled={isDelete === b.id}
                                  className={`text-gray-600 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 ${
                                    isDelete === b.id ? "opacity-50 cursor-not-allowed" : ""
                                  }`}
                                  title="Anular"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                
                              </div>
                            </TableCell>
                          </tr>
                        ))}
                      </tbody>

                      {/* Paginación de bitácoras */}
                      {metaBitacoras.totalPages > 0 && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={6} className="px-6 py-4">
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-xs text-gray-600">
                                  Página {metaBitacoras.page} de {metaBitacoras.totalPages} ({metaBitacoras.total} total)
                                </div>
                                <div className="flex space-x-1">
                                  <PaginationButtons
                                    currentPage={metaBitacoras.page}
                                    totalPages={metaBitacoras.totalPages}
                                    onPageChange={setPaginaActualBitacoras}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Componentes modales */}
        <ModalDetalleBitacora
          isOpen={modalDetalleOpen}
          onClose={() => setModalDetalleOpen(false)}
          bitacora={bitacoraSeleccionada}
          sistemas={sistemas}
          equipos={equipos}
          tipo_servicio={tipo_servicio}
          fase_implementacion={fase_implementacion}
          isLoading={!sistemas.length || !equipos.length || !tipo_servicio.length || !fase_implementacion.length}
        />

        {showNewBitacora && clienteSeleccionado && (
          <FormNuevaBitacora
            clienteId={clienteSeleccionado.id}
            nombreCliente={clienteSeleccionado.empresa}
            onClose={() => setShowNewBitacora(false)}
            onGuardar={() => {
              cargarBitacoras(clienteSeleccionado.id);
              cargarClientePorId(clienteSeleccionado.id);
              setShowNewBitacora(false);
              setIntervaloActivo(true);
            }}
            horasPaquete={clienteSeleccionado.horas_paquetes}
            horasIndividuales={clienteSeleccionado.horas_individuales}
            sistemas={sistemas}
            equipos={equipos}
            tipoServicio={tipo_servicio}
            fases={fase_implementacion}
          />
        )}

        {showPago && clienteSeleccionado && (
          <ModalPago
            clienteId={clienteSeleccionado.id}
            onClose={() => setShowPago(false)}
            onGuardar={() => {
              cargarBitacoras(clienteSeleccionado.id);
              cargarClientePorId(clienteSeleccionado.id);
              setShowPago(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default BuscarCliente;