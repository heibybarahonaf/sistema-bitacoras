"use client";

import { useEffect, useState } from "react";
import ModalUsuario from "@/components/ModalUsuario";

interface Usuario {
  id: number;
  nombre: string;
  password: string;
  correo: string;
  rol: string;
  activo: boolean;
  zona_asignada: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);

  // Obtener usuarios desde la API
  async function fetchUsuarios() {
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios");
      const response = await res.json();
      if (!res.ok || response.code !== 200) throw new Error(response.message);
      setUsuarios(response.results ?? []);
    } catch (error) {
      console.error(error);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsuarios();
    }, []);

  // Crear o editar usuario
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
      telefono: formData.get("telefono") as string,
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosUsuario),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear usuario");

      fetchUsuarios();
      setModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      alert(message);
      console.error("Error en handleCrearUsuario:", error);
    }
  }

  //Eliminar
  async function handleEliminarUsuario(id: number) {
    if (!confirm("¿Eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar usuario");
      fetchUsuarios();
    } catch (error) {
      alert("Error al eliminar usuario");
      console.error(error);
    }
  }

  // Abrir modal para editar usuario
  function abrirEditarUsuario(cliente: Usuario) {
    setUsuarioEditar(cliente);
    setModalOpen(true);
  }

  // Guardar usuario editado
  async function handleEditarCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuarioEditar) return;

    const formData = new FormData(event.currentTarget);
    const usuarioActualizado = {
      nombre: formData.get("nombre") as string,
      password: formData.get("password") as string,
      correo: formData.get("correo") as string,
      rol: formData.get("rol") as string,
      zona_asignada: formData.get("zona_asignada") as string,
      activo: formData.get("activo") === "true", // ← Convierte string a boolean
      telefono: formData.get("telefono") as string,
      updateAt: new Date().toISOString(),
    };
    
    try {
      const res = await fetch(`/api/usuarios/${usuarioEditar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioActualizado),
      });


      if (!res.ok) throw new Error("Error al actualizar usuario");

      fetchUsuarios();
      setModalOpen(false);
      setUsuarioEditar(null);
    } catch (error) {
      alert("Error al actualizar usuario");
      console.error(error);
    }
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
        <p>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Nombre</th>
                <th className="px-4 py-3 border-b text-left">Correo</th>
                <th className="px-4 py-3 border-b text-left">Rol</th>
                <th className="px-4 py-3 border-b text-left">Zona</th>
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
      )}

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
        <form onSubmit={handleSubmitUsuario} className="space-y-4">
          {[
            { label: "Nombre", name: "nombre", type: "text", placeholder: "Nombre de usuario" },
            { label: "Correo", name: "correo", type: "email", placeholder: "Correo electrónico" },
            { label: "Contraseña", name: "password", type: "password", placeholder: "Contraseña" },
            { label: "Teléfono", name: "telefono", type: "tel", placeholder: "Número telefónico", maxLength: 10 },
            { label: "Zona Asignada", name: "zona_asignada", type: "text", placeholder: "Zona asignada" },
            { label: "Rol", name: "rol", type: "select", options: [
                { label: "Técnico", value: "tecnico" },
                { label: "Administrador", value: "admin" }
              ]
            }
          ].map(({ label, name, type, placeholder, maxLength, options }) => (
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
                  maxLength={maxLength}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
                />
              )}
            </label>
          ))
          }
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