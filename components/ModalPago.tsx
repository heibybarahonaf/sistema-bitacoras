import Swal from "sweetalert2"
import { Pagos_Cliente } from "@prisma/client"
import React, { useState, useEffect } from "react";

interface ModalPagoProps {
  clienteId: number;
  onClose: () => void;
  onGuardar: () => void;
  pago?: Pagos_Cliente; // opcional, si se va a editar
}

export default function ModalPago({
  clienteId,
  onClose,
  onGuardar,
  pago,
}: ModalPagoProps) {
  const [cantHoras, setCantHoras] = useState(0);
  const [tipoHoras, setTipoHoras] = useState("Paquete");
  const [monto, setMonto] = useState(0);
  const [noFactura, setNoFactura] = useState("");
  const [formaPago, setFormaPago] = useState("Efectivo");
  const [detallePago, setDetallePago] = useState("");
  const [config, setConfig] = useState({
    valor_hora_paquete: 0,
    valor_hora_individual: 0,
    comision: 0,
  });

  // Pre-cargar datos si es edición
  useEffect(() => {
    if (pago) {
      setNoFactura(pago.no_factura || "");
      setFormaPago(pago.forma_pago || "Efectivo");
      setDetallePago(pago.detalle_pago || "");
      setTipoHoras(pago.tipo_horas || "Paquete");
      setCantHoras(pago.cant_horas || 0);
      setMonto(pago.monto || 0);
    }
  }, [pago]);

  // Obtener configuración de precios
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
            comision: conf.comision,
          });
        }
      } catch (error) {
        console.error("Error al cargar configuración", error);
      }
    };

    fetchConfig();
  }, []);

  // Recalcular monto si cambia cantidad o tipo
  useEffect(() => {
    const precioPorHora =
      tipoHoras === "Paquete"
        ? config.valor_hora_paquete + (config.valor_hora_paquete*(config.comision/100))
        : config.valor_hora_individual + (config.valor_hora_individual*(config.comision/100));
    setMonto(cantHoras * precioPorHora);
  }, [cantHoras, tipoHoras, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const datosPago = {
      cliente_id: clienteId,
      no_factura: noFactura,
      forma_pago: formaPago,
      detalle_pago: detallePago,
      monto,
      tipo_horas: tipoHoras,
      cant_horas: cantHoras,
    };

    const url = pago ? `/api/pagos/${pago.id}` : "/api/pagos";
    const method = pago ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosPago),
    });

    if (res.ok) {
      onGuardar();
      onClose();
    } else if(res.status === 403){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No tienes permiso para realizar esta acción!'
      });
    } 
    else {
      alert("Error al guardar el pago");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {pago ? "Editar Pago" : "Registrar Pago de Horas"}
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
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
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
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
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
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </label>

          {/* Tipo de horas */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              Tipo de Horas {pago ? null : <span className="text-red-600">*</span>}
            </span>
            <select
              value={tipoHoras}
              onChange={(e) => setTipoHoras(e.target.value)}
              required={!pago}
              disabled={!!pago}
              className={`mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                pago
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed focus:ring-0"
                  : "border-gray-300 focus:ring-[#295d0c]"
              }`}
            >
              <option value="Paquete">Paquete</option>
              <option value="Individual">Individual</option>
            </select>
          </label>

          
          {/* Cantidad de horas */}
          <label className="block">
            <span className="text-gray-800 font-semibold">
              Cantidad de Horas {pago ? null : <span className="text-red-600">*</span>}
            </span>
            <input
              type="number"
              value={cantHoras}
              onChange={(e) => setCantHoras(parseInt(e.target.value) || 0)}
              min={1}
              required={!pago}
              disabled={!!pago}
              className={`mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                pago
                  ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0"
                  : "border-gray-300 focus:ring-[#295d0c]"
              }`}
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
              {pago ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
