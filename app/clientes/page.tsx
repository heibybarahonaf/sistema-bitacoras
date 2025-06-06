"use client";

import { useEffect, useState } from "react";
import ModalCliente from "@/components/ModalCliente";
import { date } from "zod/v4";

interface Cliente {
  id: number;
  responsable: string;
  empresa: string;
  rtn: string;
  telefono: string;
  correo: string;
  activo: boolean;
  horas_individuales: number;
  horas_paquetes: number;
}

export default function ClientesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);

  // Obtener clientes desde la API
  async function fetchClientes() {
    setLoading(true);
    try {
      const res = await fetch("/api/clientes");
      const response = await res.json();
      if (!res.ok || response.code !== 200) throw new Error(response.message);
      setClientes(response.results);
    } catch (error) {
      console.error(error);
      alert("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  // Crear cliente
  async function handleCrearCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nuevoCliente = {
      empresa: formData.get("empresa") as string,
      responsable: formData.get("responsable") as string,
      rtn: formData.get("rtn") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      correo: formData.get("correo") as string,
      fecha_registro: new Date().toISOString(),
      activo: true, //Siempre activo por defecto
      horas_paquetes: 0,
      horas_individuales: 0,
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    };


    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoCliente),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear cliente");

      fetchClientes();
      setModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      alert(message);
      console.error("Error en handleCrearCliente:", error);
    }
  }

  // Eliminar cliente
  async function handleEliminarCliente(id: number) {
    if (!confirm("¿Eliminar este cliente?")) return;

    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar cliente");
      fetchClientes();
    } catch (error) {
      alert("Error al eliminar cliente");
      console.error(error);
    }
  }

  // Abrir modal para editar cliente
  function abrirEditarCliente(cliente: Cliente) {
    setClienteEditar(cliente);
    setModalOpen(true);
  }

  // Guardar cliente editado
  async function handleEditarCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clienteEditar) return;

    const formData = new FormData(event.currentTarget);
    const clienteActualizado = {
      empresa: formData.get("empresa") as string,
      responsable: formData.get("responsable") as string,
      rtn: formData.get("rtn") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      correo: formData.get("correo") as string,
      activo: formData.get("activo") === "true", // ← Convierte string a boolean
    };


    try {
      const res = await fetch(`/api/clientes/${clienteEditar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteActualizado),
      });


      if (!res.ok) throw new Error("Error al actualizar cliente");

      fetchClientes();
      setModalOpen(false);
      setClienteEditar(null);
    } catch (error) {
      alert("Error al actualizar cliente");
      console.error(error);
    }
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800">
        Gestión de Clientes
      </h1>

        <button
          onClick={() => {
            setClienteEditar(null);
            setModalOpen(true);
          }}
          className="mb-6 bg-[#295d0c] text-white px-5 py-3 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
        >
          Agregar Cliente
        </button>

      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left">Empresa</th>
                <th className="px-4 py-3 border-b text-left">Responsable</th>
                <th className="px-4 py-3 border-b text-left">RTN</th>
                <th className="px-4 py-3 border-b text-left">Teléfono</th>
                <th className="px-4 py-3 border-b text-left">Correo</th>
                <th className="px-4 py-3 border-b text-center">Activo</th>
                <th className="px-4 py-3 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-b">{cliente.empresa}</td>
                  <td className="px-4 py-3 border-b">{cliente.responsable}</td>
                  <td className="px-4 py-3 border-b">{cliente.rtn}</td>
                  <td className="px-4 py-3 border-b">{cliente.telefono}</td>
                  <td className="px-4 py-3 border-b">{cliente.correo}</td>
                  <td className="px-4 py-3 border-b text-center">
                    {cliente.activo ? (
                      <span className="text-green-600 font-semibold">✅</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b text-center space-x-3">
                    <button
                      className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]"
                      onClick={() => abrirEditarCliente(cliente)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024]"
                      onClick={() => handleEliminarCliente(cliente.id)}
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

      <ModalCliente isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {clienteEditar ? "Editar Cliente" : "Nuevo Cliente"}
        </h2>
        <form onSubmit={clienteEditar ? handleEditarCliente : handleCrearCliente}>
          {[
            { label: "Empresa", name: "empresa", type: "text", placeholder: "Nombre empresa" },
            { label: "Responsable", name: "responsable", type: "text", placeholder: "Nombre responsable" },
            { label: "RTN", name: "rtn", type: "text", placeholder: "Registro tributario" },
            { label: "Dirección", name: "direccion", type: "text", placeholder: "Dirección" },
            { label: "Teléfono", name: "telefono", type: "tel", placeholder: "Número telefónico", maxLength: 10 },
            { label: "Correo", name: "correo", type: "email", placeholder: "Correo electrónico" },
          ].map(({ label, name, type, placeholder, maxLength }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium">
              {label}:
              <input
                defaultValue={clienteEditar ? (clienteEditar as any)[name] : ""}
                type={type}
                name={name}
                placeholder={placeholder}
                maxLength={maxLength}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              />
            </label>
          ))}
          {clienteEditar && (
            <label className="block mb-4 text-gray-800 font-medium">
              Estado:
              <select
              name="activo"
              defaultValue={clienteEditar.activo ? "true" : "false"}
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
              {clienteEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </ModalCliente>
    </div>
  );
}
