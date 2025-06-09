"use client";

import { useEffect, useState } from "react";
import ModalUsuario from "@/components/ModalUsuario";
import Swal from 'sweetalert2';

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

// carga
const LoadingSpinner = () => (

  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#295d0c] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Cargando usuarios...</p>

  </div>
);


export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);


  // formatear el teléfono
  const formatearTelefono = (valor: string) => {

    const soloNumeros = valor.replace(/\D/g, '');
    const limitado = soloNumeros.slice(0, 8);
    
    if (limitado.length > 4) {
      return limitado.slice(0, 4) + '-' + limitado.slice(4);
    }
    
    return limitado;
  };


  const manejarCambioTelefono = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearTelefono(event.target.value);
    event.target.value = valorFormateado;
  };
  

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

  // Obtener usuarios desde la API
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
      
      // por si acaso results viene vacío con código 200
      if (!response.results || response.results.length === 0) {
        setShowEmptyMessage(true);
      }

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error al cargar usuarios',
        text: error instanceof Error ? error.message : 'Error inesperado al cargar los usuarios',
        confirmButtonColor: '#295d0c'
      });

    } finally {
      setLoading(false);
    }

  }


  useEffect(() => {

    if (isClient) {
      fetchUsuarios();
    }

  }, [isClient]);


  // Crear usuario
  async function handleSubmitUsuario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const datosUsuario = {
      nombre: formData.get("nombre") as string,
      password: formData.get("password") as string,
      correo: formData.get("correo") as string,
      rol: formData.get("rol") as string,
      zona_asignada: formData.get("zona_asignada") as string,
      activo: true, //Siempre activo por defecto
      fecha_ingreso: new Date().toISOString(), 
      telefono: formData.get("telefono") as string
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
        icon: 'success',
        title: '¡Usuario creado!',
        text: data.message || 'Usuario creado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchUsuarios();
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
  async function handleEliminarUsuario(id: number) {

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
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok || data.code !== 200) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: data.message || 'Error al eliminar usuario',
          confirmButtonColor: '#295d0c'
        });

        return;
      }

      Swal.fire({
        icon: 'success',
        title: '¡Usuario eliminado!',
        text: data.message || 'Usuario eliminado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchUsuarios();

    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        confirmButtonColor: '#295d0c'
      });
    }

  }

  // Abrir modal para editar usuario
  function abrirEditarUsuario(cliente: Usuario) {
    setUsuarioEditar(cliente);
    setModalOpen(true);
  }

  // guardar editado
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
      activo: formData.get("activo") === "true", // ← Convierte string a boolean
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
        icon: 'success',
        title: '¡Usuario actualizado!',
        text: data.message || 'Usuario actualizado correctamente',
        confirmButtonColor: '#295d0c'
      });

      fetchUsuarios();
      setModalOpen(false);
      setUsuarioEditar(null);

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
          setUsuarioEditar(null);
          setModalOpen(true);
        }}
        className="mb-6 bg-[#295d0c] text-white px-5 py-3 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
      >
        Agregar Usuario
      </button>

      {loading ? (
        <LoadingSpinner />
      ) : usuarios.length === 0 && showEmptyMessage ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg">No hay usuarios registrados.</p>
          <p className="text-gray-500 text-sm mt-2">Haz clic en "Agregar Usuario" para comenzar.</p>
        </div>
      ) : usuarios.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Nombre</th>
                <th className="px-4 py-3 border-b text-left">Correo</th>
                <th className="px-4 py-3 border-b text-left">Rol</th>
                <th className="px-4 py-3 border-b text-left">Zona</th>
                <th className="px-4 py-3 border-b text-left">Teléfono</th>
                <th className="px-4 py-3 border-b text-center">Activo</th>
                <th className="px-4 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{usuario.nombre}</td>
                  <td className="px-4 py-3 border-b">{usuario.correo}</td>
                  <td className="px-4 py-3 border-b">{usuario.rol}</td>
                  <td className="px-4 py-3 border-b">{usuario.zona_asignada}</td>
                  <td className="px-4 py-3 border-b">{formatearTelefono(usuario.telefono)}</td>
                  <td className="px-4 py-3 border-b text-center">
                    {usuario.activo ? "✅" : "❌"}
                  </td>
                  <td className="px-4 py-3 border-b text-center space-x-3">
                    <button
                      onClick={() => {
                        setUsuarioEditar(usuario);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarUsuario(usuario.id)}
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
        <form onSubmit={usuarioEditar ? handleEditarCliente : handleSubmitUsuario} className="space-y-4">
          {[
            { label: "Nombre", name: "nombre", type: "text", placeholder: "Nombre de usuario" },
            { label: "Correo", name: "correo", type: "email", placeholder: "Correo electrónico" },
            { label: "Contraseña", name: "password", type: "password", placeholder: "Contraseña" },
            { label: "Zona Asignada", name: "zona_asignada", type: "text", placeholder: "Zona asignada" },
            { label: "Rol", name: "rol", type: "select", options: [
                { label: "Técnico", value: "tecnico" },
                { label: "Administrador", value: "admin" }
              ]
            }
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
          ))
          }
          
          {/* separado por el formateo */}
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