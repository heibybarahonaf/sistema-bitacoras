"use client";

import { useState, useEffect } from "react";

interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  usuarioActual: any; // Puedes tipar mejor si quieres
}

export default function ModalUsuario({ isOpen, onClose, onSave, usuarioActual }: ModalUsuarioProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (usuarioActual) {
      setNombre(usuarioActual.nombre || "");
      setEmail(usuarioActual.email || "");
      setActivo(usuarioActual.activo ?? true);
    } else {
      setNombre("");
      setEmail("");
      setActivo(true);
    }
  }, [usuarioActual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim()) {
      alert("Por favor completa nombre y email.");
      return;
    }

    // Aquí iría la llamada a la API para crear o actualizar usuario (comentado)
    /*
    const method = usuarioActual ? "PUT" : "POST";
    const url = usuarioActual ? `/api/usuarios/${usuarioActual.id}` : "/api/usuarios";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, activo }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.message || "Error al guardar usuario");
      return;
    }
    */

    // Simulamos guardado exitoso
    alert(`Usuario ${usuarioActual ? "actualizado" : "creado"} con éxito (simulado)`);

    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{usuarioActual ? "Editar Usuario" : "Agregar Usuario"}</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <label className="inline-flex items-center mb-4">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="mr-2"
            />
            Activo
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
