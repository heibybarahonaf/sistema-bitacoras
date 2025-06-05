"use client";

import { useState, useEffect } from "react";
import ModalUsuario from "@/components/ModalUsuario"; // Asumo que tendrás un modal para agregar/editar usuarios

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  // Fetch usuarios desde API (comentar mientras no haya API)
  /*
  const fetchUsuarios = async () => {
  const res = await fetch("/api/usuarios");
  const data = await res.json();
  setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);
  */

  const handleModalClose = () => {
    setModalOpen(false);
    setUsuarioActual(null);
  };

  const handleSave = () => {
    // Refrescar lista luego de guardar
    // fetchUsuarios();
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("¿Estás seguro que deseas eliminar este usuario?");
    if (!confirmDelete) return;

    try {
      /*
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al eliminar");
      }

      fetchUsuarios();
      */
    } catch (error: any) {
      alert(`Error al eliminar el usuario: ${error.message}`);
    }
  };

  // Datos de prueba para mostrar la tabla antes de conectar con API
  const datosPrueba = [
    {
      id: 1,
      nombre: "Heiby Barahona",
      correo: "heiby@mail.com",
      rol: "admin",
      activo: true,
      zona_asignada: "Zona Norte",
      fecha_ingreso: "2025-06-04T10:30:00",
      telefono: "98765432",
    },
    {
      id: 2,
      nombre: "Jorge Canales",
      correo: "jorge@mail.com",
      rol: "tecnico",
      activo: false,
      zona_asignada: "Zona Sur",
      fecha_ingreso: "2025-06-04T08:15:00",
      telefono: "91234567",
    },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800">
        Gestión de Usuarios
      </h1>

      <button
        onClick={() => setModalOpen(true)}
        className="mb-6 bg-[#295d0c] text-white px-5 py-3 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
      >
        Agregar Usuario
      </button>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Nombre</th>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Correo</th>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Rol</th>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Zona Asignada</th>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Teléfono</th>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Fecha Ingreso</th>
              <th className="text-center px-4 py-3 font-medium border-b border-gray-300">Activo</th>
              <th className="text-center px-4 py-3 font-medium border-b border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios.length ? usuarios : datosPrueba).map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-3 border-b border-gray-200">{usuario.nombre}</td>
                <td className="px-4 py-3 border-b border-gray-200">{usuario.correo}</td>
                <td className="px-4 py-3 border-b border-gray-200">{usuario.rol}</td>
                <td className="px-4 py-3 border-b border-gray-200">{usuario.zona_asignada || "-"}</td>
                <td className="px-4 py-3 border-b border-gray-200">{usuario.telefono || "-"}</td>
                <td className="px-4 py-3 border-b border-gray-200">
                  {new Date(usuario.fecha_ingreso).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-center">
                  {usuario.activo ? (
                    <span className="text-green-600 font-semibold">Sí</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-center space-x-2">
                  <button
                    onClick={() => {
                      setUsuarioActual(usuario);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50] transition-colors duration-200 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(usuario.id)}
                    className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024] transition-colors duration-200 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ModalUsuario
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          usuarioActual={usuarioActual}
        />
      )}
    </div>
  );
}

