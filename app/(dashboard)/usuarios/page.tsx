"use client";

import { useEffect, useState } from "react";
import ModalUsuario from "@/components/ModalUsuario";
import Swal from "sweetalert2";
import { Trash2, Users, Edit3, Plus } from "lucide-react";

interface Usuario {
  id: number;
  nombre: string;
  password: string;
  correo: string;
  rol: string;
  telefono: string;
  activo: boolean;
  zona_asignada: string;
}

interface ErrorDeValidacion {
  code: number;
  message?: string;
  results?: {
    campo: string;
    mensajes: string[];
  }[];
}

// Componente Spinner carga
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#295d0c] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Cargando usuarios...</p>
  </div>
);

export default function UsuariosPage() {
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");

  //Estados para paginacion
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5; //Cambiar este valor para mostrar mas o menos usuarios por pagina

  //Detectar cliente para evitar render server
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Función para formatear telefono
  const formatearTelefono = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const limitado = soloNumeros.slice(0, 8);
    if (limitado.length > 4) {
      return limitado.slice(0, 4) + "-" + limitado.slice(4);
    }
    return limitado;
  };

  // Manejar input teléfono formateado
  const manejarCambioTelefono = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearTelefono(event.target.value);
    event.target.value = valorFormateado;
  };

  // Mostrar errores validación con SweetAlert
  function mostrarErroresValidacion(data: ErrorDeValidacion) {
    if (data.code !== 200 && data.code !== 201 && data.results && data.results.length > 0) {
      const erroresHtml = data.results
        .map(
          (error) =>
            `<div class="mb-2"><ul class="ml-4 mt-1">${
              error.mensajes && Array.isArray(error.mensajes)
                ? error.mensajes.map((msg: string) => `<li>• ${msg}</li>`).join("")
                : "<li>Error inesperado!</li>"
            }</ul></div>`
        )
        .join("");

      Swal.fire({
        icon: "error",
        title: "Errores de validación",
        html: `<div class="text-left">${erroresHtml}</div>`,
        confirmButtonColor: "#295d0c",
        width: "500px",
      });
    } else {
      if (data.code !== 200 && data.code !== 201) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error inesperado",
          confirmButtonColor: "#295d0c",
        });
      }
    }
  }

  // Fetch usuarios desde API
  async function fetchUsuarios() {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const res = await fetch("/api/usuarios");
      const response = await res.json();

      if (response.code === 404) {
        setUsuarios([]);
        setShowEmptyMessage(true);
        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar usuarios");
      }

      setUsuarios(response.results ?? []);

      if (!response.results || response.results.length === 0) {
        setShowEmptyMessage(true);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar usuarios",
        text: error instanceof Error ? error.message : "Error inesperado al cargar los usuarios",
        confirmButtonColor: "#295d0c",
      });
    } finally {
      setLoading(false);
    }
  }

  // Cargar usuarios al montar y cuando isClient sea true
  useEffect(() => {
    if (isClient) {
      fetchUsuarios();
    }
  }, [isClient]);

  // Guardar nuevo usuario
  async function handleSubmitUsuario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const datosUsuario = {
      nombre: formData.get("nombre") as string,
      password: formData.get("password") as string,
      correo: formData.get("correo") as string,
      rol: formData.get("rol") as string,
      zona_asignada: formData.get("zona_asignada") as string,
      activo: true,
      fecha_ingreso: new Date().toISOString(),
      telefono: formData.get("telefono") as string,
    };

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosUsuario),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Usuario creado!",
        text: data.message || "Usuario creado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchUsuarios();
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

  // Eliminar usuario
  async function handleEliminarUsuario(id: number) {
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
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.code !== 200) {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: data.message || "Error al eliminar usuario",
          confirmButtonColor: "#295d0c",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Usuario eliminado!",
        text: data.message || "Usuario eliminado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchUsuarios();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });
    }
  }

  // Abrir modal para editar usuario
  function abrirEditarUsuario(usuario: Usuario) {
    setUsuarioEditar(usuario);
    setModalOpen(true);
  }

  // Actualizar usuario
  async function handleEditarCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuarioEditar) return;

    const formData = new FormData(event.currentTarget);
    const usuarioActualizado: any = {
      nombre: formData.get("nombre") as string,
      password: formData.get("password") as string,
      rol: formData.get("rol") as string,
      zona_asignada: formData.get("zona_asignada") as string,
      telefono: formData.get("telefono") as string,
      activo: formData.get("activo") === "true",
      updateAt: new Date().toISOString(),
    };

    const nuevoCorreo = formData.get("correo") as string;
    if (nuevoCorreo !== usuarioEditar.correo) {
      usuarioActualizado.correo = nuevoCorreo;
    }

    try {
      const res = await fetch(`/api/usuarios/${usuarioEditar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioActualizado),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Usuario actualizado!",
        text: data.message || "Usuario actualizado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchUsuarios();
      setModalOpen(false);
      setUsuarioEditar(null);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });
    }
  }

  // Filtrar usuarios por nombre para paginación
  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  // Calcular usuarios a mostrar en la página actual
  const indexUltimoUsuario = paginaActual * usuariosPorPagina;
  const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario);

  // Cambiar página
  function cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1) return;
    if (nuevaPagina > Math.ceil(usuariosFiltrados.length / usuariosPorPagina)) return;
    setPaginaActual(nuevaPagina);
  }

  if (!isClient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <Users className="w-8 h-8 text-[#295d0c]" />
        Gestión de Usuarios
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre de usuario..."
          value={filtroNombre}
          onChange={(e) => {
            setFiltroNombre(e.target.value);
            setPaginaActual(1); // Reset paginación al filtrar
          }}
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
        />
        <button
          onClick={() => {
            setUsuarioEditar(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-[#295d0c] text-white px-3 py-2 sm:px-5 sm:py-3 rounded-md text-sm sm:text-base hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
        >
          <Plus className="w-5 h-5" />
          Agregar Usuario
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : usuariosFiltrados.length === 0 && showEmptyMessage ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg">No hay usuarios registrados.</p>
          <p className="text-gray-500 text-sm mt-2">Haz clic en "Agregar Usuario" para comenzar.</p>
        </div>
      ) : usuariosFiltrados.length > 0 ? (
        <>
          {/* Tabla para pantallas >= sm */}
          <div className="hidden sm:block overflow-x-auto rounded-lg shadow border border-gray-300">
            <table className="min-w-full table-auto border-collapse text-sm sm:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 border-b text-left">Nombre</th>
                  <th className="px-2 sm:px-4 py-2 border-b text-left">Correo</th>
                  <th className="px-2 sm:px-4 py-2 border-b text-left">Rol</th>
                  <th className="px-2 sm:px-4 py-2 border-b text-left">Zona</th>
                  <th className="px-2 sm:px-4 py-2 border-b text-left">Teléfono</th>
                  <th className="px-2 sm:px-4 py-2 border-b text-center">Activo</th>
                  <th className="px-2 sm:px-4 py-2 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPaginados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 border-b">{usuario.nombre}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">{usuario.correo}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">{usuario.rol}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">{usuario.zona_asignada}</td>
                    <td className="px-2 sm:px-4 py-2 border-b">{formatearTelefono(usuario.telefono)}</td>
                    <td className="px-2 sm:px-4 py-2 border-b text-center">{usuario.activo ? "✅" : "❌"}</td>
                    <td className="px-2 sm:px-4 py-2 border-b text-center space-x-2">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => abrirEditarUsuario(usuario)}
                          className="flex px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50] text-sm"
                        >
                          <Edit3 className="w-5 h-5 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarUsuario(usuario.id)}
                          className="flex px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024] text-sm"
                        >
                          <Trash2 className="w-5 h-5 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para pantallas < sm */}
          <div className="sm:hidden flex flex-col gap-4">
            {usuariosPaginados.map((usuario) => (
              <div
                key={usuario.id}
                className="border border-gray-300 rounded-lg p-4 shadow bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{usuario.nombre}</h3>
                  <span
                    className={`text-sm font-semibold ${
                      usuario.activo ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Correo: </strong>
                  {usuario.correo}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Rol: </strong>
                  {usuario.rol}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Zona: </strong>
                  {usuario.zona_asignada}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Teléfono: </strong>
                  {formatearTelefono(usuario.telefono)}
                </p>
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    onClick={() => abrirEditarUsuario(usuario)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50] text-sm"
                  >
                    <Edit3 className="w-5 h-5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarUsuario(usuario.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024] text-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Controles paginación */}
          <div className="mt-6 flex justify-center items-center gap-4 select-none">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={`px-4 py-2 rounded-md font-semibold ${
                paginaActual === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#295d0c] text-white hover:bg-[#23480a]"
              }`}
            >
              Anterior
            </button>
            <span className="text-gray-700 font-medium">
              Página {paginaActual} de {Math.max(1, Math.ceil(usuariosFiltrados.length / usuariosPorPagina))}
            </span>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual >= Math.ceil(usuariosFiltrados.length / usuariosPorPagina)}
              className={`px-4 py-2 rounded-md font-semibold ${
                paginaActual >= Math.ceil(usuariosFiltrados.length / usuariosPorPagina)
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#295d0c] text-white hover:bg-[#23480a]"
              }`}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : null}

      {/* Modal para agregar/editar usuario */}
      <ModalUsuario
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUsuarioEditar(null);
        }}
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {usuarioEditar ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
        <form
          onSubmit={usuarioEditar ? handleEditarCliente : handleSubmitUsuario}
          className="space-y-4"
        >
          {[
            { label: "Nombre", name: "nombre", type: "text", placeholder: "Nombre de usuario" },
            { label: "Correo", name: "correo", type: "email", placeholder: "Correo electrónico" },
            { label: "Contraseña", name: "password", type: "password", placeholder: "Contraseña" },
            { label: "Zona Asignada", name: "zona_asignada", type: "text", placeholder: "Zona asignada" },
            {
              label: "Rol",
              name: "rol",
              type: "select",
              options: [
                { label: "Técnico", value: "tecnico" },
                { label: "Administrador", value: "admin" },
              ],
            },
          ].map(({ label, name, type, placeholder, options }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium">
              <span className="text-gray-700">{label}:</span>

              {type === "select" ? (
                <select
                  name={name}
                  defaultValue={usuarioEditar ? (usuarioEditar as any)[name] : "tecnico"}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
                >
                  {options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  defaultValue={usuarioEditar ? (usuarioEditar as any)[name] : ""}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
                />
              )}
            </label>
          ))}

          <label className="block mb-4 text-gray-800 font-medium">
            <span className="text-gray-700">Teléfono:</span>
            <input
              name="telefono"
              type="tel"
              placeholder="Número telefónico"
              defaultValue={usuarioEditar ? formatearTelefono(usuarioEditar.telefono) : ""}
              onChange={manejarCambioTelefono}
              maxLength={9}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

          {usuarioEditar && (
            <label className="block mb-4 text-gray-800 font-medium">
              <span className="text-gray-700">Estado:</span>
              <select
                name="activo"
                defaultValue={usuarioEditar.activo ? "true" : "false"}
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
              {usuarioEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalUsuario>
    </div>
  );
}
