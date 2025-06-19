"use client";

import React, { useEffect, useState } from "react";
import FormNuevaBitacora from "@/components/ModalBitacora";
import ModalPago from "@/components/ModalPago";
import { Eye, Notebook } from "lucide-react";
import ModalDetalleBitacora from "@/components/ModalDetalleBitacora";
import Swal from "sweetalert2";
import { Bitacora } from "@prisma/client";

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

const BuscarCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [bitacoras, setBitacoras] = useState<any[]>([]);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);
  const [showNewBitacora, setShowNewBitacora] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [bitacoraSeleccionada, setBitacoraSeleccionada] = useState<Bitacora | null>(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

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
    if (clienteSeleccionado?.id) {
      cargarBitacoras(clienteSeleccionado.id);
    } else {
      setBitacoras([]);
    }
  }, [clienteSeleccionado]);

  const clientesFiltrados = clientes.filter((c) =>
    c.empresa.toLowerCase().includes(filtro.toLowerCase()) || c.rtn.includes(filtro)
  );

  return (
    <div className="w-full p-6 bg-white min-h-screen">
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
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 sm:px-4 py-2 border-b text-left">Empresa</th>
              <th className="px-2 sm:px-4 py-2 border-b text-left">RTN</th>
              <th className="px-2 sm:px-4 py-2 border-b text-left"></th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{c.empresa}</td>
                <td className="px-4 py-2 border-b">{c.rtn}</td>
                <td className="px-4 py-2 text-center border-b">
                  <button
                    onClick={() => setClienteSeleccionado(c)}
                    className="px-3 py-1 bg-[#295d0c] text-white rounded hover:bg-[#23480a] flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

          <div className="p-1 border rounded bg-gray-50 flex justify-between">
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
                <strong>Total:</strong> {clienteSeleccionado.horas_paquetes + clienteSeleccionado.horas_individuales} - {formatoLempiras(clienteSeleccionado.monto_paquetes + clienteSeleccionado.monto_individuales)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">BITÁCORAS</h3>
              <div className="space-x-2">
                <button onClick={() => setShowNewBitacora(true)} className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]">Nueva</button>
                <button onClick={() => setShowPago(true)} className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024]">Pago</button>
              </div>
            </div>

            <ModalDetalleBitacora
              isOpen={modalDetalleOpen}
              onClose={() => setModalDetalleOpen(false)}
              bitacora={bitacoraSeleccionada}
              sistemas={sistemas}
              equipos={equipos}
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
                  {bitacoras.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b">{b.no_ticket}</td>
                      <td className="px-4 py-3 border-b">{new Date(b.fecha_servicio).toLocaleDateString()}</td>
                      <td className="px-4 py-3 border-b">{b.horas_consumidas} ({b.tipo_horas})</td>
                      <td className="px-4 py-3 border-b">{b.fase_implementacion}</td>
                      <td className="px-4 py-3 border-b">{b.descripcion_servicio}</td>
                      <td className="px-4 py-3 border-b text-center">
                        <button
                          onClick={() => mostrarDetalleBitacora(b)}
                          className="px-3 py-1 bg-[#295d0c] text-white rounded hover:bg-[#23480a] flex items-center gap-1"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuscarCliente;

