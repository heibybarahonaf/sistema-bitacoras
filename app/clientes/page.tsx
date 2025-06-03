"use client";

import { useState } from "react";
import ModalCliente from "@/components/ModalCliente";

export default function ClientesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const clientes = [
    {
      id: 1,
      responsable: "Heiby Barahona",
      empresa: "Empresa S.A.",
      rtn: "08011993123960",
      telefono: "99998888",
      correo: "heiby@example.com",
      activo: true,
    },
    {
      id: 2,
      responsable: "Jorge Canales",
      empresa: "Canales Ltda.",
      rtn: "08011994123456",
      telefono: "88887777",
      correo: "jorge@example.com",
      activo: false,
    },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800">
      Gestión de Clientes
      </h1>


      <button
        onClick={() => setModalOpen(true)}
        className="mb-6 bg-[#295d0c] text-white px-5 py-3 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
      >
        Agregar Cliente
      </button>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left text-gray-700 px-4 py-3 font-medium border-b border-gray-300">Empresa</th>
              <th className="text-left text-gray-700 px-4 py-3 font-medium border-b border-gray-300">Responsable</th>
              <th className="text-left text-gray-700 px-4 py-3 font-medium border-b border-gray-300">RTN</th>
              <th className="text-left text-gray-700 px-4 py-3 font-medium border-b border-gray-300">Teléfono</th>
              <th className="text-left text-gray-700 px-4 py-3 font-medium border-b border-gray-300">Correo</th>
              <th className="text-center text-gray-700 px-4 py-3 font-medium border-b border-gray-300">Activo</th>
              <th className="text-center text-gray-700 px-4 py-3 font-medium border-b border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="hover:bg-gray-50 transition-colors duration-200 cursor-default"
              >
                <td className="px-4 py-3 border-b border-gray-200">{cliente.empresa}</td>
                <td className="px-4 py-3 border-b border-gray-200">{cliente.responsable}</td>
                <td className="px-4 py-3 border-b border-gray-200">{cliente.rtn}</td>
                <td className="px-4 py-3 border-b border-gray-200">{cliente.telefono}</td>
                <td className="px-4 py-3 border-b border-gray-200">{cliente.correo}</td>
                <td className="px-4 py-3 border-b border-gray-200 text-center font-semibold text-sm">
                  {cliente.activo ? (
                    <span className="text-green-600">Sí</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-center space-x-3">
                  <button
                    className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50] transition-colors duration-200 text-sm font-medium"
                    onClick={() => alert(`Editar cliente ${cliente.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024] transition-colors duration-200 text-sm font-medium"
                    onClick={() => alert(`Eliminar cliente ${cliente.id}`)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalCliente isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Nuevo Cliente</h2>
        <form>
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
                type={type}
                name={name}
                placeholder={placeholder}
                maxLength={maxLength}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              />
            </label>
          ))}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a] transition-colors duration-300"
            >
              Guardar
            </button>
          </div>
        </form>
      </ModalCliente>
    </div>
  );
}
