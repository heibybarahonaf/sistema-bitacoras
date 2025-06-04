"use client";

import { useState, useEffect } from "react";
import ModalUsuario from "@/components/ModalUsuario"; // Suponiendo que harás un modal similar al de clientes

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  // Función para cargar usuarios (por ahora, ejemplo vacío o datos de prueba)
  const fetchUsuarios = async () => {
    // Aquí la llamada a la API (comentada por ahora)
    /*
    const res = await fetch("/api/usuarios");
    const data = await res.json();
    setUsuarios(data);
    */
    
    // Datos de prueba
    setUsuarios([
      { id: 1, nombre: "Juan Pérez", email: "juan@example.com", activo: true },
      { id: 2, nombre: "Ana Gómez", email: "ana@example.com", activo: false },
    ]);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    setUsuarioActual(null);
  };

  const handleSave = () => {
    fetchUsuarios();
  };

  const handleDelete = (id: number) => {
    if (!confirm("¿Estás seguro que deseas eliminar este usuario?")) return;
    // Aquí iría la lógica para eliminar por API cuando esté lista
    alert(`Eliminar usuario con id: ${id} (simulado)`);
    // Luego recargar lista
    fetchUsuarios();
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800">
        Gestión de Usuarios
      </h1>

      <button
        onClick={() => setModalOpen(true)}
        className="mb-6 bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800 transition-colors duration-300 font-semibold shadow"
      >
        Agregar Usuario
      </button>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Nombre</th>
              <th className="text-left px-4 py-3 font-medium border-b border-gray-300">Email</th>
              <th className="text-center px-4 py-3 font-medium border-b border-gray-300">Activo</th>
              <th className="text-center px-4 py-3 font-medium border-b border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-3 border-b border-gray-200">{usuario.nombre}</td>
                <td className="px-4 py-3 border-b border-gray-200">{usuario.email}</td>
                <td className="px-4 py-3 border-b border-gray-200 text-center">
                  {usuario.activo ? (
                    <span className="text-green-600 font-semibold">Sí</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-center">
                  <button
                    onClick={() => {
                      setUsuarioActual(usuario);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(usuario.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
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

