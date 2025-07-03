"use client";

import Swal from "sweetalert2";
import ModalPago from "@/components/ModalPago";
import React, { useEffect, useState } from "react";
import { Eye, Notebook, Download } from "lucide-react";
import FormNuevaBitacora from "@/components/ModalBitacora";
import ModalDetalleBitacora from "@/components/ModalDetalleBitacora";
import { Bitacora, Cliente, Sistema, Equipo, Tipo_Servicio, Fase_Implementacion } from "@prisma/client";

const BuscarCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [showNewBitacora, setShowNewBitacora] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [bitacoraSeleccionada, setBitacoraSeleccionada] = useState<Bitacora | null>(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tipo_servicio, setTipoServicio] = useState<Tipo_Servicio[]>([]);
  const [fase_implementacion, setFaseImplementacion] = useState<Fase_Implementacion[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todas");


  // Paginación clientes
  const [paginaActualClientes, setPaginaActualClientes] = useState(1);
  const clientesPorPagina = 5;

  // Paginación bitácoras
  const [paginaActualBitacoras, setPaginaActualBitacoras] = useState(1);
  const bitacorasPorPagina = 10;

  const formatoLempiras = (valor: number) =>
    valor.toLocaleString("es-HN", { style: "currency", currency: "HNL" });

  const mostrarDetalleBitacora = (bitacora: Bitacora) => {
    setBitacoraSeleccionada(bitacora);
    setModalDetalleOpen(true);
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch("/api/clientes");
        const data = await res.json();
        if (data.code === 200) {
          setClientes(data.results || []);
        }
      } catch (error) {
        console.error("Error al cargar clientes", error);
      }
    };

    const fetchTipoServicioYFases = async () => {
      try {
        const [resServicio, resFases] = await Promise.all([
          fetch("/api/tipo-servicio"),
          fetch("/api/fase-implementacion"),
        ]);
        const dataServicios = await resServicio.json();
        const dataFases = await resFases.json();

        setTipoServicio(dataServicios.results || []);
        setFaseImplementacion(dataFases.results || []);
      } catch (error) {
        console.error("Error al cargar tipos de servicio", error);
      }
    };

    const fetchSistemasYEquipos = async () => {
      try {
        const [resSistemas, resEquipos] = await Promise.all([
          fetch("/api/sistemas/activos"),
          fetch("/api/equipos/activos"),
        ]);
        const dataSistemas = await resSistemas.json();
        const dataEquipos = await resEquipos.json();

        setSistemas(dataSistemas.results || []);
        setEquipos(dataEquipos.results || []);
      } catch (error) {
        console.error("Error al cargar sistemas y equipos", error);
      }
    };

    fetchClientes();
    fetchSistemasYEquipos();
    fetchTipoServicioYFases();
  }, []);

  const cargarBitacoras = async (clienteId: number) => {
    setLoadingBitacoras(true);
    try {
      const res = await fetch(`/api/bitacoras/cliente/${clienteId}`);
      const data = await res.json();
      setBitacoras(data.results || []);
    } catch (err) {
      console.error("Error al cargar bitácoras", err);
    } finally {
      setLoadingBitacoras(false);
    }
  };

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

  useEffect(() => {
    setPaginaActualClientes(1);
  }, [filtro]);

  useEffect(() => {
    if (clienteSeleccionado?.id) {
      cargarBitacoras(clienteSeleccionado.id);
      setPaginaActualBitacoras(1);
    } else {
      setBitacoras([]);
    }
  }, [clienteSeleccionado]);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.empresa.toLowerCase().includes(filtro.toLowerCase()) || c.rtn.includes(filtro)
  );

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

  // Paginación clientes
  const totalPaginasClientes = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const clientesMostrar = clientesFiltrados.slice(
    (paginaActualClientes - 1) * clientesPorPagina,
    paginaActualClientes * clientesPorPagina
  );

  // Paginación bitácoras
  const bitacorasFiltradas = bitacoras.filter((b: any) => {
  if (filtroEstado === "pendientes") return !b.firmaCliente?.firma_base64;
  if (filtroEstado === "firmadas") return !!b.firmaCliente?.firma_base64;
  return true;
});

const totalPaginasBitacoras = Math.ceil(bitacorasFiltradas.length / bitacorasPorPagina);
const bitacorasMostrar = bitacorasFiltradas.slice(
  (paginaActualBitacoras - 1) * bitacorasPorPagina,
  paginaActualBitacoras * bitacorasPorPagina
);


  return (
    <div className="w-full p-6 pb-20 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <Notebook className="w-8 h-8 text-[#295d0c]" />
        Gestión de Bitácoras
      </h1>

      <h2 className="text-xl font-bold mb-4">Buscar Cliente</h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
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
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left ">Empresa</th>
                <th className="px-2 sm:px-4 py-2 text-left">RTN</th>
                <th className="px-2 sm:px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {clientesMostrar.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 ">{c.empresa}</td>
                  <td className="px-4 py-2 ">{c.rtn}</td>
                  <td className="px-4 py-2 text-center ">
                    <button
                      onClick={() => setClienteSeleccionado(c)}
                      className="mr-2 text-[#295d0c] hover:text-[#173a01]">
                      <Eye size={25}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación Clientes */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setPaginaActualClientes((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActualClientes === 1}
              className={`px-3 py-1 rounded ${
                paginaActualClientes === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Anterior
            </button>

            <span className="text-gray-700 font-medium">
              Página {paginaActualClientes} de {Math.max(1, totalPaginasClientes)}
            </span>

            <button
              onClick={() => setPaginaActualClientes((prev) => Math.min(prev + 1, totalPaginasClientes))}
              disabled={paginaActualClientes === totalPaginasClientes}
              className={`px-3 py-1 rounded ${
                paginaActualClientes === totalPaginasClientes
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Siguiente
            </button>
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              ← Volver a búsqueda
            </button>
          </div>

          <div className="w-full mx-auto p-4 bg-gray-100 rounded mb-6 flex flex-col sm:flex-row justify-between gap-4">
          {/* Datos del cliente */}
          <div className="flex-1 space-y-2 text-left">
            <p className="font-bold text-sm text-gray-700">DATOS DEL CLIENTE</p>
            <p><strong>Empresa:</strong> {clienteSeleccionado.empresa}</p>
            <p><strong>Responsable:</strong> {clienteSeleccionado.responsable}</p>
            <p><strong>RTN:</strong> {clienteSeleccionado.rtn}</p>
            <p><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>
            <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>
            <p><strong>Correo:</strong> {clienteSeleccionado.correo}</p>
          </div>

          {/* Horas y saldos */}
          <div className="flex-1 space-y-2 text-left sm:text-right">
            <p className="font-bold text-sm text-gray-700">HORAS - SALDOS</p>
            <p><strong>Paquetes:</strong> {clienteSeleccionado.horas_paquetes} - {formatoLempiras(clienteSeleccionado.monto_paquetes)}</p>
            <p><strong>Individuales:</strong> {clienteSeleccionado.horas_individuales} - {formatoLempiras(clienteSeleccionado.monto_individuales)}</p>
            <p className="mt-4 border-t pt-2 font-semibold">
              <strong>Total:</strong>{" "}
              {clienteSeleccionado.horas_paquetes + clienteSeleccionado.horas_individuales} -{" "}
              {formatoLempiras(clienteSeleccionado.monto_paquetes + clienteSeleccionado.monto_individuales)}
            </p>
          </div>
        </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">BITÁCORAS</h3>

                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setPaginaActualBitacoras(1); // Reinicia la paginación al cambiar el filtro
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
                  onClick={() => setShowNewBitacora(true)}
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
              <p className="text-gray-500">Este cliente no tiene bitácoras registradas.</p>
            ) : (
              <>
                <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left">Ticket</th>
                    <th className="px-2 sm:px-4 py-3 text-left">Fecha</th>
                    <th className="px-2 sm:px-4 py-3 text-left hidden md:table-cell">Horas</th>
                    <th className="px-2 sm:px-4 py-3 text-left hidden lg:table-cell">Fase</th>
                    <th className="px-2 sm:px-4 py-3 text-left hidden xl:table-cell">Descripción</th>
                    <th className="px-2 sm:px-4 py-3 text-left">Firma</th>
                    <th className="px-2 sm:px-4 py-3 text-center">Acciones</th>
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
                      {new Date(b.fecha_servicio).toLocaleDateString("es-HN", {
                        timeZone: "UTC",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>

                    {/* Horas (oculta en <768px) */}
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                      {b.horas_consumidas} ({b.tipo_horas})
                    </td>

                    {/* Fase (oculta en <1024px) */}
                    <td className="px-2 sm:px-4 py-3 hidden lg:table-cell">
                      {b.fase_implementacion?.fase || '—'}
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
                          isDownloading === b.id ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>

                {/* Paginación Bitácoras */}
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => setPaginaActualBitacoras((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaActualBitacoras === 1}
                    className={`px-3 py-1 rounded ${
                      paginaActualBitacoras === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Anterior
                  </button>

                  <span className="text-gray-700 font-medium">
                    Página {paginaActualBitacoras} de {Math.max(1, totalPaginasBitacoras)}
                  </span>

                  <button
                    onClick={() =>
                      setPaginaActualBitacoras((prev) => Math.min(prev + 1, totalPaginasBitacoras))
                    }
                    disabled={paginaActualBitacoras === totalPaginasBitacoras}
                    className={`px-3 py-1 rounded ${
                      paginaActualBitacoras === totalPaginasBitacoras
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuscarCliente;
