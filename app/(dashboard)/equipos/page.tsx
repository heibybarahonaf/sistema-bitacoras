"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ModalEquipo from "@/components/ModalEquipo";
import { MonitorSmartphone, Plus, Edit3, Trash2 } from "lucide-react";

interface Equipo {
  id: number;
  equipo: string;
  descripcion: string;
  activo: boolean;
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
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [equipoEditar, setEquipoEditar] = useState<Equipo | null>(null);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [isEquipo, setIsEquipo] = useState(false);
  const [filtroEquipo, setFiltroEquipo] = useState("");

  useEffect(() => {
    setIsEquipo(true);
  }, []);

  useEffect(() => {
    if (isEquipo) fetchEquipos();
  }, [isEquipo]);

  // Mostrar errores de validación
  function mostrarErroresValidacion(data: any) {
    if (data.code !== 200 && data.code !== 201 && data.results?.length > 0) {
      const erroresHtml = data.results
        .map((error: any) => `
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
  async function fetchEquipos() {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const res = await fetch("/api/equipos");
      const response = await res.json();

      if (response.code === 404) {
        setEquipos([]);
        setShowEmptyMessage(true);
        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar equipos");
      }

      setEquipos(response.results ?? []);
      if (!response.results?.length) {
        setShowEmptyMessage(true);
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
  }

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
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <MonitorSmartphone className="w-8 h-8 text-[#295d0c]" />
        Gestión de Equipos
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Buscar equipo por nombre..."
          value={filtroEquipo}
          onChange={(e) => setFiltroEquipo(e.target.value)}
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
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Nombre</th>
                <th className="px-4 py-3 border-b text-left">Descripción</th>
                <th className="px-4 py-3 border-b text-center">Activo</th>
                <th className="px-4 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos
                .filter((eq) =>
                  eq.equipo.toLowerCase().includes(filtroEquipo.toLowerCase())
                )
                .map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">{eq.equipo}</td>
                    <td className="px-4 py-3 border-b">{eq.descripcion}</td>
                    <td className="px-4 py-3 border-b text-center">
                      {eq.activo ? "✅" : "❌"}
                    </td>
                    <td className="px-4 py-3 border-b text-center space-x-3">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => abrirEditarEquipo(eq)}
                          className="flex px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]"
                        >
                          <Edit3 className="w-5 h-5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarEquipo(eq.id)}
                          className="flex px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024]"
                        >
                          <Trash2 className="w-5 h-5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalEquipo
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEquipoEditar(null);
        }}
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {equipoEditar ? "Editar Equipo" : "Nuevo Equipo"}
        </h2>

        <form onSubmit={equipoEditar ? handleEditarEquipo : handleSubmitEquipo} className="space-y-4">
          {[
            { label: "Equipo", name: "equipo", type: "text", placeholder: "Nombre del equipo" },
            { label: "Descripción", name: "descripcion", type: "text", placeholder: "Descripción del equipo" },
          ].map(({ label, name, type, placeholder }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium">
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
              className="px-5 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a]"
            >
              {equipoEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalEquipo>
    </div>
  );
}
