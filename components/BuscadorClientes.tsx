"use client";

import Swal from "sweetalert2";
import { Bitacora } from "@prisma/client";
import ModalPago from "@/components/ModalPago";
import React, { useEffect, useState } from "react";
import { Eye, Notebook, Download } from "lucide-react";
import FormNuevaBitacora from "@/components/ModalBitacora";
import ModalDetalleBitacora from "@/components/ModalDetalleBitacora";

interface Cliente {
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
  createdAt: string;
  updatedAt: string;
}

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
  const [tipo_servicio, setTipoServicio] = useState<TipoServicio[]>([]);
  const [fase_implementacion, setFaseImplementacion] = useState<FaseImplementacion[]>([]);

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
  const totalPaginasBitacoras = Math.ceil(bitacoras.length / bitacorasPorPagina);
  const bitacorasMostrar = bitacoras.slice(
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
                <th className="px-2 sm:px-4 py-2 border-b text-left">Empresa</th>
                <th className="px-2 sm:px-4 py-2 border-b text-left">RTN</th>
                <th className="px-2 sm:px-4 py-2 border-b text-left"></th>
              </tr>
            </thead>
            <tbody>
              {clientesMostrar.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{c.empresa}</td>
                  <td className="px-4 py-2 border-b">{c.rtn}</td>
                  <td className="px-4 py-2 text-center border-b">
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

          <div
            className="w-[550px] sm:w-full mx-auto p-4 bg-gray-50 border rounded flex justify-between mb-6"
          >
            <div className="flex flex-col space-y-2 text-left">
              <p><strong>DATOS DEL CLIENTE</strong></p>
              <p><strong>Empresa:</strong> {clienteSeleccionado.empresa}</p>
              <p><strong>Responsable:</strong> {clienteSeleccionado.responsable}</p>
              <p><strong>RTN:</strong> {clienteSeleccionado.rtn}</p>
              <p><strong>Dirección:</strong> {clienteSeleccionado.direccion}</p>
              <p><strong>Teléfono:</strong> {clienteSeleccionado.telefono}</p>
              <p><strong>Correo:</strong> {clienteSeleccionado.correo}</p>
            </div>

            <div className="flex flex-col space-y-2 text-right">
              <p><strong>HORAS - SALDOS</strong></p>
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
              <h3 className="text-lg font-semibold">BITÁCORAS</h3>
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
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 border-b text-left">Ticket</th>
                      <th className="px-4 py-3 border-b text-left">Fecha</th>
                      <th className="px-4 py-3 border-b text-left">Horas consumidas</th>
                      <th className="px-4 py-3 border-b text-left">Fase</th>
                      <th className="px-4 py-3 border-b text-left">Descripción</th>
                      <th className="px-4 py-3 border-b text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bitacorasMostrar.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border-b">{b.no_ticket}</td>
                        <td
                          className="px-4 py-3 border-b"
                          title={new Date(b.fecha_servicio).toLocaleString()}
                        >
                          {new Date(b.fecha_servicio).toLocaleDateString("es-HN", {
                            timeZone: "UTC",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 border-b">
                          {b.horas_consumidas} ({b.tipo_horas})
                        </td>
                        <td className="px-4 py-3 border-b">{b.fase_implementacion?.fase || '—'}</td>
                        <td className="px-4 py-3 border-b">{b.descripcion_servicio}</td>
                        <td className="px-4 py-3 border-b text-center">
                          <button
                            onClick={() => mostrarDetalleBitacora(b)}
                            title="Ver detalles"
                            className="mr-2 text-[#295d0c] hover:text-[#173a01]"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDownload(b.id)}
                            title="Descargar PDF"
                            disabled={isDownloading === b.id}
                            className={`text-[#2e3763] hover:text-[#171f40] ${
                              isDownloading === b.id ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <Download size={20} />
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
