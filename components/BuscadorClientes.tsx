"use client";

import Swal from "sweetalert2";
import ModalPago from "@/components/ModalPago";
import React, { useEffect, useState, useCallback } from "react";
import { Eye, Notebook, Download } from "lucide-react";
import FormNuevaBitacora from "@/components/ModalBitacora";
import ModalDetalleBitacora from "@/components/ModalDetalleBitacora";
import {
  Bitacora,
  Cliente,
  Sistema,
  Equipo,
  Tipo_Servicio,
  Fase_Implementacion,
} from "@prisma/client";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BuscarCliente: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
  const [tipo_servicio, setTipoServicio] = useState<Tipo_Servicio[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [bitacoraSeleccionada, setBitacoraSeleccionada] = useState<Bitacora | null>(null);
  const [fase_implementacion, setFaseImplementacion] = useState<Fase_Implementacion[]>([]);

  const [showPago, setShowPago] = useState(false);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);
  const [showNewBitacora, setShowNewBitacora] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroActual, setFiltroActual] = useState("");

  const [paginaActualClientes, setPaginaActualClientes] = useState(1);
  const [paginaActualBitacoras, setPaginaActualBitacoras] = useState(1);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [metaClientes, setMetaClientes] = useState<PaginationMeta>({total: 0, page: 1, limit: 5, totalPages: 0});
  const [metaBitacoras, setMetaBitacoras] = useState<PaginationMeta>({total: 0, page: 1, limit: 10, totalPages: 0 });

  const formatoLempiras = (valor: number) => valor.toLocaleString("es-HN", { style: "currency", currency: "HNL" });

  const mostrarDetalleBitacora = async (bitacora: Bitacora) => {

    try {

      await cargarDatosComunes();
      setBitacoraSeleccionada(bitacora);
      setModalDetalleOpen(true);

    } catch (error) {
      console.error("Error al cargar detalles", error);
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

    } catch (error) {
      console.error("Error al cargar datos comunes", error);
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

  const cargarBitacoras = useCallback(async (clienteId: number, page: number = 1) => {
    setLoadingBitacoras(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: metaBitacoras.limit.toString(),
        ...(filtroEstado !== "todas" && { estado: filtroEstado }),
      });

      const res = await fetch(`/api/bitacoras/cliente/${clienteId}?${params}`);

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
  }, [filtroEstado, metaBitacoras.limit]);

  const cargarClientePorId = async (clienteId: number) => {
    try {
      
      const res = await fetch(`/api/clientes/${clienteId}`);
      const data = await res.json();
      if (data.code === 200 && data.results?.length > 0) {
        setClienteSeleccionado(data.results[0]);
      }

    } catch (error) {
      console.error("Error al recargar cliente", error);
    }
  };

  const cambiarPaginaBitacoras = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= metaBitacoras.totalPages) {
      setPaginaActualBitacoras(nuevaPagina);
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
    }, 500);

    return () => clearTimeout(timer);
  }, [filtro, filtroActual]);

  useEffect(() => {
  let intervalId: NodeJS.Timeout;

  if (clienteSeleccionado?.id) {
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
      } catch (error) {
        console.error("Error al hacer polling de firmas:", error);
      }
    }, 5000); 
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [metaBitacoras,clienteSeleccionado?.id, paginaActualBitacoras, filtroEstado, bitacoras]);


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

  const handleNuevaBitacora = async () => {
    try {
      await cargarDatosComunes();
      setShowNewBitacora(true);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  const bitacorasMostrar = bitacoras; 
  const totalPaginasBitacoras = metaBitacoras.totalPages;

  return (
    <div className="w-full p-6 pb-20 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <Notebook className="w-8 h-8 text-[#295d0c]" />
        Gestión de Bitácoras
      </h1>

      <h2 className="text-l font-bold mb-4">Buscar Cliente</h2>
      <div className="flex flex-col text-xs sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Buscar por Empresa o RTN"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
        />
      </div>

      {clientesFiltrados.length > 0 && !clienteSeleccionado && (
        <>
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left ">Empresa</th>
                <th className="px-2 sm:px-4 py-2 text-left">RTN</th>
                <th className="px-2 sm:px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 ">{c.empresa}</td>
                  <td className="px-4 py-2 ">{c.rtn}</td>
                  <td className="px-4 py-2 text-center ">
                    <button
                      onClick={() => setClienteSeleccionado(c)}
                      className="mr-2 text-[#295d0c] hover:text-[#173a01]"
                    >
                      <Eye size={25} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-600">
              Mostrando {clientes.length} de {metaClientes.total} clientes
              {filtroActual && ` para "${filtroActual}"`}
            </div>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPaginaActualClientes(1)}
                disabled={metaClientes.page === 1}
                className="px-3 py-1 rounded text-xs border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Primera
              </button>
              <button
                onClick={() => setPaginaActualClientes(metaClientes.page - 1)}
                disabled={metaClientes.page === 1}
                className="px-3 py-1 rounded border text-xs border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 bg-[#295d0c] text-white text-xs rounded font-medium">
                {metaClientes.page}
              </span>
              <button
                onClick={() => setPaginaActualClientes(metaClientes.page + 1)}
                disabled={metaClientes.page === metaClientes.totalPages}
                className="px-3 py-1 rounded border border-gray-400 text-xs bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
              <button
                onClick={() => setPaginaActualClientes(metaClientes.totalPages)}
                disabled={metaClientes.page === metaClientes.totalPages}
                className="px-3 py-1 rounded border border-gray-400 bg-white text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Última
              </button>
            </div>
          </div>
        </>
      )}

      {clienteSeleccionado && (
        <>
          <div className="mb-4">
            <button
              onClick={() => {
                setClienteSeleccionado(null);
                setFiltro("");
              }}
              className="px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded hover:bg-gray-300 transition"
            >
              ← Volver a búsqueda
            </button>
          </div>

          <div className="w-full mx-auto p-4 text-sm bg-gray-100 rounded mb-6 flex flex-col sm:flex-row justify-between gap-4">
            {/* Datos del cliente */}
            <div className="flex-1 space-y-2 text-left">
              <p className="font-bold text-sm text-gray-700">
                DATOS DEL CLIENTE
              </p>
              <p>
                <strong>Empresa:</strong> {clienteSeleccionado.empresa}
              </p>
              <p>
                <strong>Responsable:</strong> {clienteSeleccionado.responsable}
              </p>
              <p>
                <strong>RTN:</strong> {clienteSeleccionado.rtn}
              </p>
              <p>
                <strong>Dirección:</strong> {clienteSeleccionado.direccion}
              </p>
              <p>
                <strong>Teléfono:</strong> {clienteSeleccionado.telefono}
              </p>
              <p>
                <strong>Correo:</strong> {clienteSeleccionado.correo}
              </p>
            </div>

            {/* Horas y saldos */}
            <div className="flex-1 space-y-2 text-left sm:text-right">
              <p className="font-bold text-sm text-gray-700">HORAS - SALDOS</p>
              <p>
                <strong>Paquetes:</strong> {clienteSeleccionado.horas_paquetes}{" "}
                - {formatoLempiras(clienteSeleccionado.monto_paquetes)}
              </p>
              <p>
                <strong>Individuales:</strong>{" "}
                {clienteSeleccionado.horas_individuales} -{" "}
                {formatoLempiras(clienteSeleccionado.monto_individuales)}
              </p>
              <p className="mt-4 border-t pt-2 font-semibold">
                <strong>Total:</strong>{" "}
                {clienteSeleccionado.horas_paquetes +
                  clienteSeleccionado.horas_individuales}{" "}
                -{" "}
                {formatoLempiras(
                  clienteSeleccionado.monto_paquetes +
                    clienteSeleccionado.monto_individuales
                )}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col sm:flex-row text-sm sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">BITÁCORAS</h3>

                  <select
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setPaginaActualBitacoras(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
                  >
                    <option value="todas">Todas</option>
                    <option value="pendientes">Pendientes</option>
                    <option value="firmadas">Firmadas</option>
                  </select>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      cargarClientePorId(clienteSeleccionado.id);
                      cargarBitacoras(clienteSeleccionado.id, paginaActualBitacoras);
                      Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title:"Datos actualizados",
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                      });
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Actualizar
                  </button>
                  <button
                    onClick={handleNuevaBitacora}
                    className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]"
                  >
                    Nueva
                  </button>
                  <button
                    onClick={() => setShowPago(true)}
                    className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024]"
                  >
                    Pago
                  </button>
                </div>
              </div>
            </div>

            <ModalDetalleBitacora
              isOpen={modalDetalleOpen}
              onClose={() => setModalDetalleOpen(false)}
              bitacora={bitacoraSeleccionada}
              sistemas={sistemas}
              equipos={equipos}
              tipo_servicio={tipo_servicio}
              fase_implementacion={fase_implementacion}
              isLoading={
                !sistemas.length || !equipos.length ||
                !tipo_servicio.length || !fase_implementacion.length
              }
            />

            {showNewBitacora && (
              <FormNuevaBitacora
                clienteId={clienteSeleccionado.id}
                onClose={() => setShowNewBitacora(false)}
                onGuardar={() => {
                  cargarBitacoras(clienteSeleccionado.id);
                  cargarClientePorId(clienteSeleccionado.id);
                  setShowNewBitacora(false);
                }}
              />
            )}

            {showPago && (
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

            {loadingBitacoras ? (
              <p className="text-gray-600">Cargando bitácoras...</p>
            ) : bitacoras.length === 0 ? (
              <p className="text-gray-500">
                Este cliente no tiene bitácoras registradas.
              </p>
            ) : (
              <>
                <table className="w-full table-auto border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left">Ticket</th>
                      <th className="px-2 sm:px-4 py-3 text-left">Fecha</th>
                      <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">
                        Horas
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left hidden lg:table-cell">
                        Fase
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left hidden xl:table-cell">
                        Descripción
                      </th>
                      <th className="px-2 sm:px-4 py-3 text-left">Firma</th>
                      <th className="px-2 sm:px-4 py-3 text-center">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bitacorasMostrar.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50 text-sm">
                        {/* Ticket (siempre visible) */}
                        <td className="px-2 sm:px-4 py-3">{b.no_ticket}</td>

                        {/* Fecha (siempre visible) */}
                        <td
                          className="px-2 sm:px-4 py-3"
                          title={new Date(b.fecha_servicio).toLocaleString()}
                        >
                          {new Date(b.fecha_servicio).toLocaleDateString(
                            "es-HN",
                            {
                              timeZone: "UTC",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )}
                        </td>

                        {/* Horas (oculta en <768px) */}
                        <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                          {b.horas_consumidas} ({b.tipo_horas})
                        </td>

                        {/* Fase (oculta en <1024px) */}
                        <td className="px-2 sm:px-4 py-3 hidden lg:table-cell">
                          {b.fase_implementacion?.fase || "—"}
                        </td>

                        {/* Descripción (oculta en <1280px) y truncada */}
                        <td
                          className="px-2 sm:px-4 py-3 hidden xl:table-cell truncate max-w-[150px]"
                          title={b.descripcion_servicio}
                        >
                          {b.descripcion_servicio}
                        </td>

                        {/* Firma (oculta en <768px) */}
                        <td className="px-2 sm:px-4 py-3">
                          {b.firmaCliente?.firma_base64 ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                              Firmada
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                              Pendiente
                            </span>
                          )}
                        </td>

                        {/* Acciones (siempre visible) */}
                        <td className="px-2 sm:px-4 py-3 text-center">
                          <button
                            onClick={() => mostrarDetalleBitacora(b)}
                            title="Ver detalles"
                            className="mr-2 text-[#295d0c] hover:text-[#173a01]"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownload(b.id)}
                            title="Descargar PDF"
                            disabled={isDownloading === b.id}
                            className={`text-[#2e3763] hover:text-[#171f40] ${
                              isDownloading === b.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {metaBitacoras.totalPages > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-gray-600">
                      Mostrando {bitacoras.length} de {metaBitacoras.total}{" "}
                      bitácoras
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => cambiarPaginaBitacoras(1)}
                        disabled={metaBitacoras.page === 1}
                        className="px-3 py-1 rounded text-xs border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Primera
                      </button>
                      <button
                        onClick={() =>
                          cambiarPaginaBitacoras(metaBitacoras.page - 1)
                        }
                        disabled={metaBitacoras.page === 1}
                        className="px-3 py-1 rounded border text-xs border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1 bg-[#295d0c] text-white text-xs rounded font-medium">
                        {metaBitacoras.page}
                      </span>
                      <button
                        onClick={() =>
                          cambiarPaginaBitacoras(metaBitacoras.page + 1)
                        }
                        disabled={
                          metaBitacoras.page === metaBitacoras.totalPages
                        }
                        className="px-3 py-1 rounded border border-gray-400 text-xs bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                      <button
                        onClick={() =>
                          cambiarPaginaBitacoras(metaBitacoras.totalPages)
                        }
                        disabled={
                          metaBitacoras.page === metaBitacoras.totalPages
                        }
                        className="px-3 py-1 rounded text-xs border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Última
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuscarCliente;
