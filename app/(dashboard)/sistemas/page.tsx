"use client";

import Swal from 'sweetalert2';
import { Sistema } from "@prisma/client";
import ModalSistema from "@/components/ModalSistema";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState, useCallback } from "react";
import { Settings2, Plus, Edit3, Trash2 } from "lucide-react";
import PaginationButtons from "@/components/PaginationButtons";
import { TableHeader, TableCell } from "@/components/TableComponents";

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

export default function SistemasPage() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroActual, setFiltroActual] = useState("");

  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [sistemaEditar, setSistemaEditar] = useState<Sistema | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({total: 0, page: 1, limit: 10, totalPages: 0});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroActual(filtroNombre);
      setPaginaActual(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroNombre]);

  function mostrarErroresValidacion(data: ErrorDeValidacion) {

    if (data.code !== 200 && data.code !== 201 && data.results && data.results.length > 0) {
      const erroresHtml = data.results.map((error) =>
        `<div class="mb-2"><ul class="ml-4 mt-1">${
          error.mensajes?.map((msg: string) => `<li>• ${msg}</li>`).join("") || '<li>Error inesperado!</li>'
        }</ul></div>`
      ).join('');

      Swal.fire({
        icon: 'error',
        title: 'Errores de validación',
        html: `<div class="text-left">${erroresHtml}</div>`,
        confirmButtonColor: '#295d0c',
        width: '500px'
      });

    } else if (data.code !== 200 && data.code !== 201) {

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message || 'Error inesperado',
        confirmButtonColor: '#295d0c'
      });

    }
  }

  const fetchSistemas = useCallback(async () => {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        limit: meta.limit.toString(),
        ...(filtroActual && { search: filtroActual })
      });

      const res = await fetch(`/api/sistemas?${params}`);
      const response = await res.json();

      if (response.code === 404) {
        setMeta({
          total: 0,
          page: paginaActual,
          limit: meta.limit,
          totalPages: 0
        });

        setSistemas([]);
        setShowEmptyMessage(true);
        
        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar los sistemas");
      }

      setSistemas(response.results ?? []);
      if (!response.results?.length) {
        setShowEmptyMessage(true);
      }
      
      if (response.meta) {
        setMeta(response.meta);
      }

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error al cargar sistemas',
        text: error instanceof Error ? error.message : 'Error inesperado',
        confirmButtonColor: '#295d0c'
      });
      
    } finally {
      setLoading(false);
    }
  }, [paginaActual, filtroActual, meta.limit]);

  useEffect(() => {
    if (isClient) fetchSistemas();
  }, [fetchSistemas ,isClient, paginaActual, filtroActual]);

  async function handleSubmitSistema(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const datosSistema = {
      sistema: formData.get("sistema") as string,
      descripcion: formData.get("descripcion") as string,
      activo: true
    };

    try {
      const res = await fetch("/api/sistemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosSistema),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: 'success',
        title: '¡Sistema creado!',
        text: data.message || 'Sistema creado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchSistemas();
      setPaginaActual(1);
      setModalOpen(false);

    } catch {

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#295d0c'
      });

    } finally {
      setIsSaving(false);
    }
  }

  async function handleEliminarSistema(id: number) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/sistemas/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.code !== 200) {

        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: data.message || 'Error al eliminar sistema',
          confirmButtonColor: '#295d0c'
        });

        return;
      }

      if (sistemas.length === 1 && paginaActual > 1) {
        setPaginaActual(paginaActual - 1);
      } else {
        fetchSistemas();
      }

      Swal.fire({
        icon: 'success',
        title: '¡Sistema eliminado!',
        text: data.message || 'Sistema eliminado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchSistemas();

    } catch {

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#295d0c'
      });
    }

  }

  function abrirEditarSistema(sistema: Sistema) {
    setSistemaEditar(sistema);
    setModalOpen(true);
  }

  async function handleEditarSistema(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sistemaEditar) return;
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const sistemaActualizado = {
      sistema: formData.get("sistema") as string,
      descripcion: formData.get("descripcion") as string,
      activo: formData.get("activo") === "true",
      updateAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/sistemas/${sistemaEditar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sistemaActualizado),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: 'success',
        title: '¡Sistema actualizado!',
        text: data.message || 'Sistema actualizado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchSistemas();
      setModalOpen(false);
      setSistemaEditar(null);

    } catch {

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#295d0c'
      });

    } finally {
      setIsSaving(false);
    }
  }

  if (!isClient) return <LoadingSpinner mensaje="Cargando sistemas..." />;

  return (
    <div className="w-full p-6 pb-20 min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-2">
          <Settings2 className="w-6 h-6 text-emerald-700" />
          Gestión de Sistemas
        </h1>
        <div className="border-b border-gray-200"></div>
      </div>

      {/* Búsqueda y botón agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar sistema por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            setSistemaEditar(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Sistema
        </button>
      </div>

      {loading ? (
        <LoadingSpinner mensaje="Cargando sistemas..." />
      ) : sistemas.length === 0 && showEmptyMessage ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">⚙️</div>
          <p className="text-gray-600 text-lg">No hay sistemas registrados.</p>
          <p className="text-gray-500 text-sm mt-2">Haz clic en "Agregar Sistema" para comenzar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Descripción</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sistemas.map((sistema) => (
                  <tr key={sistema.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{sistema.sistema}</TableCell>
                    <TableCell>{sistema.descripcion}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sistema.activo 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {sistema.activo ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="justify-center gap-2">
                        <button
                          onClick={() => abrirEditarSistema(sistema)}
                          className="text-gray-600 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-emerald-50"
                          title="Editar sistema"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminarSistema(sistema.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Eliminar sistema"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
              
              {/* Pie de tabla con paginación */}
              {meta.totalPages > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-gray-600">
                          Página {meta.page} de {meta.totalPages} ({meta.total} total)
                        </div>
                        <div className="flex space-x-1">
                          <PaginationButtons
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
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

      <ModalSistema
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSistemaEditar(null);
        }}
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {sistemaEditar ? "Editar Sistema" : "Nuevo Sistema"}
        </h2>

        <form
          onSubmit={sistemaEditar ? handleEditarSistema : handleSubmitSistema}
          className="space-y-4 text-sm"
        >
          {[
            {
              label: "Sistema",
              name: "sistema",
              type: "text",
              placeholder: "Nombre de sistema",
            },
            {
              label: "Descripción",
              name: "descripcion",
              type: "text",
              placeholder: "Descripción del sistema",
            },
          ].map(({ label, name, type, placeholder }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium text-sm">
              <span className="text-gray-700">{label}:</span>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={sistemaEditar ? (sistemaEditar as any)[name] : ""}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>
          ))}

          {sistemaEditar && (
            <label className="block mb-4 text-gray-800 font-medium text-sm">
              <span className="text-gray-700">Estado:</span>
              <select
                name="activo"
                defaultValue={sistemaEditar.activo ? "true" : "false"}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
              className="px-5 py-2 text-sm rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                isSaving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#295d0c] text-white hover:bg-[#23480a]"
              }`}
            >
              {isSaving ? "Guardando..." : sistemaEditar ? "Guardar" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalSistema>
    </div>
  );
}