// components/ModalPago.tsx
import React, { useState } from "react";

export default function ModalPago({ clienteId, onClose, onGuardar }: {
  clienteId: number;
  onClose: () => void;
  onGuardar: () => void;
}) {
  const [cantHoras, setCantHoras] = useState(0);
  const [tipoHoras, setTipoHoras] = useState("Paquete");
  const [monto, setMonto] = useState(0);
  const [noFactura, setNoFactura] = useState("");
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [detallePago, setDetallePago] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoPago = {
      cliente_id: clienteId,
      no_factura: noFactura,
      forma_pago: formaPago,
      detalle_pago: detallePago,
      monto,
      tipo_horas: tipoHoras,
      cant_horas: cantHoras,
    };

    const res = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPago),
    });

    if (res.ok) {
      onGuardar();
      onClose();
    } else {
      alert("Error al registrar el pago");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Registrar Pago de Horas</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* No. Factura */}
          <label className="block">
            <span className="text-gray-700 font-medium">No. Factura</span>
            <input
              type="text"
              value={noFactura}
              onChange={(e) => setNoFactura(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              required
            />
          </label>  

            {/* Detalle del pago */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Detalle del Pago</span>
            <textarea
              value={detallePago}
              onChange={(e) => setDetallePago(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

            {/* Forma de pago */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Forma de pago</span>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </label>
          
          {/* Tipo de horas */}
          <label className="block md:col-span-2">
            <span className="text-gray-700 font-medium">Tipo de Horas</span>
            <select
              value={tipoHoras}
              onChange={(e) => setTipoHoras(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="Paquete">Paquete</option>
              <option value="Individual">Individual</option>
            </select>
          </label>

          {/* Cantidad de horas */}
          <label className="block">
            <span className="text-gray-700 font-medium">Cantidad de Horas</span>
            <input
              type="number"
              value={cantHoras}
              onChange={(e) => setCantHoras(parseInt(e.target.value))}
              min={1}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

            {/* Monto */}
          <label className="block">
            <span className="text-gray-700 font-medium">Monto</span>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(parseInt(e.target.value))}
              min={1}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-4">
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="px-5 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a]"
            >
                Guardar
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}
