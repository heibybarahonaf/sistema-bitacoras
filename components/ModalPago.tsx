import React, { useState, useEffect } from "react";

export default function ModalPago({
  clienteId,
  onClose,
  onGuardar,
}: {
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
  const [config, setConfig] = useState({
    valor_hora_paquete: 0,
    valor_hora_individual: 0,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/configuracion/1");
        const json = await res.json();
        const conf = json.results?.[0];
        if (conf) {
          setConfig({
            valor_hora_paquete: conf.valor_hora_paquete,
            valor_hora_individual: conf.valor_hora_individual,
          });
        }
      } catch (error) {
        console.error("Error al cargar configuración", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const precioPorHora =
      tipoHoras === "Paquete"
        ? config.valor_hora_paquete
        : config.valor_hora_individual;
    setMonto(cantHoras * precioPorHora);
  }, [cantHoras, tipoHoras, config]);

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

    console.log("Respuesta del servidor:", res);

    if (res.ok) {
      onGuardar();
      onClose();
    } else {
      alert("Error al registrar el pago");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Registrar Pago de Horas
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* No. Factura */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              No. Factura <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={noFactura}
              onChange={(e) => setNoFactura(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-[#295d0c] focus:border-[#295d0c]
                         transition"
              required
              aria-required="true"
            />
          </label>

          {/* Detalle del pago */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              Detalle del Pago <span className="text-red-600">*</span>
            </span>
            <textarea
              value={detallePago}
              onChange={(e) => setDetallePago(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-y min-h-[80px]
                         focus:outline-none focus:ring-2 focus:ring-[#295d0c] focus:border-[#295d0c]
                         transition"
              aria-required="true"
            />
          </label>

          {/* Forma de pago */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              Forma de pago <span className="text-red-600">*</span>
            </span>
            <select
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-[#295d0c] focus:border-[#295d0c]
                         cursor-pointer transition"
              aria-required="true"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </label>

          {/* Tipo de horas */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              Tipo de Horas <span className="text-red-600">*</span>
            </span>
            <select
              value={tipoHoras}
              onChange={(e) => setTipoHoras(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-[#295d0c] focus:border-[#295d0c]
                         cursor-pointer transition"
              aria-required="true"
            >
              <option value="Paquete">Paquete</option>
              <option value="Individual">Individual</option>
            </select>
          </label>

          {/* Cantidad de horas */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              Cantidad de Horas <span className="text-red-600">*</span>
            </span>
            <input
              type="number"
              value={cantHoras}
              onChange={(e) => setCantHoras(parseInt(e.target.value) || 0)}
              min={1}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-[#295d0c] focus:border-[#295d0c]
                         transition"
              aria-required="true"
            />
          </label>

          {/* Monto */}
          <label className="block">
            <span className="text-gray-800 font-semibold">Monto</span>
            <input
              type="number"
              value={monto}
              readOnly
              className="mt-1 w-full border border-gray-300 bg-gray-100 rounded-md px-3 py-2 text-gray-700"
              aria-readonly="true"
            />
          </label>

          {/* Botones */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a] transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
