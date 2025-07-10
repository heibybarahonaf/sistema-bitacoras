"use client";

import Swal from "sweetalert2";
import { Equipo } from "@prisma/client";
import ModalEquipo from "@/components/ModalEquipo";
import { useEffect, useState, useCallback } from "react";
import { MonitorSmartphone, Plus, Edit3, Trash2 } from "lucide-react";

interface ErrorDeValidacion {
  code: number;
  message?: string;
  results?: {
    campo: string;
    mensajes: string[];
  }[];
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#295d0c] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Cargando equipos...</p>
  </div>
);

export default function EquiposPage() {
  const [loading, setLoading] = useState(false);
  const [isEquipo, setIsEquipo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroActual, setFiltroActual] = useState("");
  
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoEditar, setEquipoEditar] = useState<Equipo | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({total: 0, page: 1, limit: 5,totalPages: 0});

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroActual(filtroNombre);
      setPaginaActual(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroNombre]);

  // Mostrar errores de validación
  function mostrarErroresValidacion(data: ErrorDeValidacion) {

    if (data.code !== 200 && data.code !== 201 && data.results && data.results.length > 0) {
      const erroresHtml = (data.results ?? [])
        .map((error) => `
          <div class="mb-2">
            <ul class="ml-4 mt-1">
              ${error.mensajes?.map((msg: string) => `<li>• ${msg}</li>`).join("") || "<li>Error inesperado!</li>"}
            </ul>
          </div>
        `)
        .join("");

      Swal.fire({
        icon: "error",
        title: "Errores de validación",
        html: `<div class="text-left">${erroresHtml}</div>`,
        confirmButtonColor: "#295d0c",
        width: "500px",
      });

    } else if (data.code !== 200 && data.code !== 201) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "Error inesperado",
        confirmButtonColor: "#295d0c",
      });

    }
  }

  // Obtener equipos desde la API
  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        limit: meta.limit.toString(),
        ...(filtroActual && { search: filtroActual })
      });

      const res = await fetch(`/api/equipos?${params}`);
      const response = await res.json();

      if (response.code === 404) {
        setMeta({
          total: 0,
          page: paginaActual,
          limit: meta.limit,
          totalPages: 0
        });

        setEquipos([]);
        setShowEmptyMessage(true);

        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar los equipos");
      }

      setEquipos(response.results ?? []);
      if (!response.results?.length) {
        setShowEmptyMessage(true);
      }

      if (response.meta) {
        setMeta(response.meta);
      }

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error al cargar equipos",
        text: error instanceof Error ? error.message : "Error inesperado",
        confirmButtonColor: "#295d0c",
      });
      
    } finally {
      setLoading(false);
    }
  }, [paginaActual, meta.limit, filtroActual]);

  useEffect(() => {
    setIsEquipo(true);
  }, []);

  useEffect(() => {
    if (isEquipo) fetchEquipos();
  }, [fetchEquipos, isEquipo, paginaActual, filtroActual]);

  // Crear equipo
  async function handleSubmitEquipo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const datosEquipo = {
      equipo: formData.get("equipo") as string,
      descripcion: formData.get("descripcion") as string,
      activo: true,
    };

    try {
      const res = await fetch("/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEquipo),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Equipo creado!",
        text: data.message || "Equipo creado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchEquipos();
      setPaginaActual(1);
      setModalOpen(false);

    } catch {

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });
    }

  }

  // Eliminar equipo
  async function handleEliminarEquipo(id: number) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/equipos/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.code !== 200) {

        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: data.message || "Error al eliminar equipo",
          confirmButtonColor: "#295d0c",
        });

        return;
      }

      if (equipos.length === 1 && paginaActual > 1) {
        setPaginaActual(paginaActual - 1);
      } else {
        fetchEquipos();
      }

      Swal.fire({
        icon: "success",
        title: "¡Equipo eliminado!",
        text: data.message || "Equipo eliminado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchEquipos();

    } catch {

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });

    }
  }

  // Abrir modal para editar
  function abrirEditarEquipo(equipo: Equipo) {
    setEquipoEditar(equipo);
    setModalOpen(true);
  }

  // Guardar edición
  async function handleEditarEquipo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!equipoEditar) return;

    const formData = new FormData(event.currentTarget);
    const equipoActualizado = {
      equipo: formData.get("equipo") as string,
      descripcion: formData.get("descripcion") as string,
      activo: formData.get("activo") === "true",
      updateAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/equipos/${equipoEditar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipoActualizado),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Equipo actualizado!",
        text: data.message || "Equipo actualizado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchEquipos();
      setModalOpen(false);
      setEquipoEditar(null);

    } catch {

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });

    }
  }

  if (!isEquipo) return <LoadingSpinner />;

  return (
    <div className="p-6 mb-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <MonitorSmartphone className="w-8 h-8 text-[#295d0c]" />
        Gestión de Equipos
      </h1>

      <div className="flex flex-col text-sm sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Buscar equipo por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
        />
        <button
          onClick={() => {
            setEquipoEditar(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#295d0c] text-white px-4 py-2 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
        >
          <Plus className="w-5 h-5" />
          Agregar Equipo
        </button>
      </div>


      {loading ? (
        <LoadingSpinner />
      ) : equipos.length === 0 && showEmptyMessage ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🖥️</div>
          <p className="text-gray-600 text-lg">No hay equipos registrados.</p>
          <p className="text-gray-500 text-sm mt-2">Haz clic en "Agregar Equipo" para comenzar.</p>
        </div>
      ) : (
        <div className="">
          <table className="w-full table-auto text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left">Nombre</th>
                <th className="px-2 sm:px-4 py-3 text-left">Descripción</th>
                <th className="px-2 sm:px-4 py-3 text-left">Activo</th>
                <th className="px-2 sm:px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos
                .map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3">{equipo.equipo}</td>
                    <td className="px-2 sm:px-4 py-3">{equipo.descripcion}</td>
                    <td className="px-2 sm:px-4 py-3">
                      {equipo.activo ? "✅" : "❌"}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => abrirEditarEquipo(equipo)}
                          className="mr-2 text-[#295d0c] hover:text-[#173a01]"
                        >
                          <Edit3/>
                        </button>
                        <button
                          onClick={() => handleEliminarEquipo(equipo.id)}
                          className="text-[#2e3763] hover:text-[#171f40]"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Controles de paginación */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Página {meta.page} de {meta.totalPages} ({meta.total} total)
            </div>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPaginaActual(1)}
                disabled={meta.page === 1}
                className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Primera
              </button>
              <button
                onClick={() => setPaginaActual(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 bg-[#295d0c] text-white rounded font-medium">
                {meta.page}
              </span>
              <button
                onClick={() => setPaginaActual(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
              <button
                onClick={() => setPaginaActual(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
                className="px-3 py-1 rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Última
              </button>
            </div>
          </div>

        </div>
      )}

      <ModalEquipo
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEquipoEditar(null);
        }}
      >
        <h2 className="text-lg font-semibold mb-6 text-gray-900">
          {equipoEditar ? "Editar Equipo" : "Nuevo Equipo"}
        </h2>

        <form onSubmit={equipoEditar ? handleEditarEquipo : handleSubmitEquipo} className="space-y-4">
          {[
            { label: "Equipo", name: "equipo", type: "text", placeholder: "Nombre del equipo" },
            { label: "Descripción", name: "descripcion", type: "text", placeholder: "Descripción del equipo" },
          ].map(({ label, name, type, placeholder }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium text-sm">
              <span className="text-gray-700">{label}:</span>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={equipoEditar ? (equipoEditar as any)[name] : ""}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              />
            </label>
          ))}

          {equipoEditar && (
            <label className="block mb-4 text-gray-800 font-medium">
              <span className="text-gray-700">Estado:</span>
              <select
                name="activo"
                defaultValue={equipoEditar.activo ? "true" : "false"}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 rounded-md bg-red-700 text-white text-sm font-semibold hover:bg-red-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-[#295d0c] text-white text-sm font-semibold hover:bg-[#23480a]"
            >
              {equipoEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalEquipo>
    </div>
  );
}
