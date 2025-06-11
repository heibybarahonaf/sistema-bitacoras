import React from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  onClose: () => void;
}

export function ModalBitacora({ onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-100 p-6 rounded-md w-full max-w-4xl relative">
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-blue-900 text-white p-2 rounded-t-md">
          <h2 className="text-lg font-semibold">Agregar bitácora de servicio</h2>
          <button onClick={onClose} className="hover:text-red-500">
            <FaTimes />
          </button>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label>No. Ticket</label>
            <input className="w-full border rounded p-1" />
          </div>
          <div>
            <label>Fecha Servicio</label>
            <input type="date" className="w-full border rounded p-1" />
          </div>
          <div>
            <label>Sistema</label>
            <select className="w-full border rounded p-1">
              <option>SELECCIONE SISTEMA</option>
              <option>a2Basico</option>
              <option>a2Plus</option>
            </select>
          </div>
          <div>
            <label>Tipo servicio</label>
            <select className="w-full border rounded p-1">
              <option>SELECCIONE TIPO SERVICIO</option>
              <option>Instalación</option>
              <option>Soporte</option>
            </select>
          </div>
          <div>
            <label>Hora Llegada</label>
            <input type="time" className="w-full border rounded p-1" />
          </div>
          <div>
            <label>Hora Salida</label>
            <input type="time" className="w-full border rounded p-1" />
          </div>
          <div>
            <label>Fase Implementación</label>
            <select className="w-full border rounded p-1">
              <option>SELECCIONE FASE</option>
              <option>Visita única</option>
              <option>Seguimiento</option>
            </select>
          </div>
          <div>
            <label>Horas Consumidas</label>
            <input className="w-full border rounded p-1" />
          </div>
          <div>
            <label>Tipo Horas</label>
            <select className="w-full border rounded p-1">
              <option>SELECCIONE</option>
              <option>Paquete</option>
              <option>Individual</option>
            </select>
          </div>
        </div>

        {/* Campos adicionales */}
        <div className="mt-4">
          <label>Ventas / Recomendaciones</label>
          <input className="w-full border rounded p-1" />
        </div>
        <div className="mt-2">
          <label>Descripción Servicio</label>
          <input className="w-full border rounded p-1" />
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center mt-4">
          <div className="space-x-2">
            <button className="bg-green-700 text-white px-4 py-1 rounded">
              Encuesta
            </button>
            <button className="bg-green-700 text-white px-4 py-1 rounded">
              Firmas
            </button>
          </div>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-4 py-1 rounded"
            >
              Cancelar
            </button>
            <button className="bg-blue-600 text-white px-4 py-1 rounded">
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}