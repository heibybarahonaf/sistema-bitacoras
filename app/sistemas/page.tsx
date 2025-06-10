"use client";

import { useEffect, useState } from "react";
import ModalSistema from "@/components/ModalSistema";
import Swal from 'sweetalert2';

interface Sistema {
  id: number;
  sistema: string;
  descripcion: string;
  activo: boolean;
}

// carga
const LoadingSpinner = () => (

  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#295d0c] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Cargando sistemas...</p>

  </div>
);

export default function SistemasPage() {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sistemaEditar, setSistemaEditar] = useState<Sistema | null>(null);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

function mostrarErroresValidacion(data: any) {

    if (data.code !== 200 && data.code !== 201 && data.results && data.results.length > 0) {
      // varios
      const erroresHtml = data.results.map((error: any) => 
        `<div class="mb-2">
          <ul class="ml-4 mt-1">
            ${error.mensajes && Array.isArray(error.mensajes) 
              ? error.mensajes.map((msg: string) => `<li>• ${msg}</li>`).join('') 
              : '<li>Error inesperado!</li>'
            }
          </ul>
        </div>`
      ).join('');

      // 1 solo
      Swal.fire({
        icon: 'error',
        title: 'Errores de validación',
        html: `<div class="text-left">${erroresHtml}</div>`,
        confirmButtonColor: '#295d0c',
        width: '500px'
      });

    } else {

      if (data.code !== 200 && data.code !== 201) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Error inesperado',
          confirmButtonColor: '#295d0c'
        });
      }

    }

  }

  // Obtener sistemas desde la API
    async function fetchSistemas() {
      setLoading(true);
      setShowEmptyMessage(false);
      
      try {
        const res = await fetch("/api/sistemas");
        const response = await res.json();
        
        if (response.code === 404) {
          setSistemas([]);
          setShowEmptyMessage(true);
          return;
        }
        
        if (!res.ok || response.code !== 200) {
          throw new Error(response.message || "Error al cargar usuarios");
        }
        
        setSistemas(response.results ?? []);
        
        // por si acaso results viene vacío con código 200
        if (!response.results || response.results.length === 0) {
          setShowEmptyMessage(true);
        }
  
      } catch (error) {
  
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar sistemas',
          text: error instanceof Error ? error.message : 'Error inesperado al cargar los sistemas',
          confirmButtonColor: '#295d0c'
        });
  
      } finally {
        setLoading(false);
      }
  
    }

    useEffect(() => {

    if (isClient) {
      fetchSistemas();
    }

  }, [isClient]);

  // Crear sistema
    async function handleSubmitSistema(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
  
      const formData = new FormData(event.currentTarget);
      const datosSistema = {
        sistema: formData.get("sistema") as string,
        descripcion: formData.get("descripcion") as string,
        activo: true //Siempre activo por defecto
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
        setModalOpen(false);
  
      } catch (error) {
  
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor',
          confirmButtonColor: '#295d0c'
        });
  
      }
    }

  //Eliminar
  async function handleEliminarSistema(id: number) {

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
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

      Swal.fire({
        icon: 'success',
        title: '¡Sistema eliminado!',
        text: data.message || 'Sistema eliminado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchSistemas();

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#295d0c'
      });
    }

  }

  // Abrir modal para editar sistema
  function abrirEditarSistema(sistema: Sistema) {
    setSistemaEditar(sistema);
    setModalOpen(true);
  }

    // guardar editado
    async function handleEditarSistema(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!sistemaEditar) return;
  
      const formData = new FormData(event.currentTarget);    
      const sistemaActualizado: any = {
        sistema: formData.get("sistema") as string,
        descripcion: formData.get("descripcion") as string,
        activo: formData.get("activo") === "true", // ← Convierte string a boolean
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
  
      } catch (error) {
  
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor',
          confirmButtonColor: '#295d0c'
        });
      }
  
    }

    if (!isClient) {
    return <LoadingSpinner />;
  }
   return (
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800">Gestión de Usuarios</h1>
  
        <button
          onClick={() => {
            setSistemaEditar(null);
            setModalOpen(true);
          }}
          className="mb-6 bg-[#295d0c] text-white px-5 py-3 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
        >
          Agregar Sistema
        </button>
  
        {loading ? (
          <LoadingSpinner />
        ) : sistemas.length === 0 && showEmptyMessage ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-gray-600 text-lg">No hay sistemas registrados.</p>
            <p className="text-gray-500 text-sm mt-2">Haz clic en "Agregar Sistema" para comenzar.</p>
          </div>
        ) : sistemas.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 border-b text-left">Nombre</th>
                  <th className="px-4 py-3 border-b text-left">Descripcion</th>
                  <th className="px-4 py-3 border-b text-center">Activo</th>
                  <th className="px-4 py-3 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sistemas.map((sistema) => (
                  <tr key={sistema.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b">{sistema.sistema}</td>
                    <td className="px-4 py-3 border-b">{sistema.descripcion}</td>
                    <td className="px-4 py-3 border-b text-center">
                      {sistema.activo ? "✅" : "❌"}
                    </td>
                    <td className="px-4 py-3 border-b text-center space-x-3">
                      <button
                        onClick={() => {
                          setSistemaEditar(sistema);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarSistema(sistema.id)}
                        className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
  
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
          <form onSubmit={sistemaEditar ? handleEditarSistema : handleSubmitSistema} className="space-y-4">
            {[
              { label: "Sistema", name: "sistema", type: "text", placeholder: "Nombre de sistema" },
              { label: "Descripcion", name: "descripcion", type: "text", placeholder: "Descripcion del sistema" },
            ].map(({ label, name, type, placeholder })  => (
            <label key={name} className="block mb-4 text-gray-800 font-medium">
              <span className="text-gray-700">{label}:</span>

              {type === "select" ? (
                <select
                  name={name}
                  defaultValue={sistemaEditar ? (sistemaEditar as any)[name] : "tecnico"}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
                >
                  
                </select>
              ) : (
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  defaultValue={sistemaEditar ? (sistemaEditar as any)[name] : ""}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
                />
              )}
            </label>
            ))
            }
  
            {sistemaEditar && (
              <label className="block mb-4 text-gray-800 font-medium">
                <span className="text-gray-700">Estado:</span>
                <select
                  name="activo"
                  defaultValue={sistemaEditar.activo ? "true" : "false"}
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
                {sistemaEditar ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </ModalSistema>
      </div>
    );
  }