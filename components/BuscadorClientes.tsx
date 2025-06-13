// components/BuscarCliente.tsx
import React, { useState, useEffect } from "react";
import FormNuevaBitacora from "@/components/ModalBitacora";
import ModalPago from "@/components/ModalPago";
import { Search } from "lucide-react";

interface Cliente {
  id: number;
  responsable: string;
  empresa: string;
  rtn: string;
  direccion: string;
  telefono: string;
  correo: string;
  activo: boolean;
  horas_paquetes: number;
  horas_individuales: number;
  monto_paquetes: number;
  monto_individuales: number;
  createdAt: string;
  updatedAt: string;
}

const BuscarCliente: React.FC = () => {
  const [rtn, setRtn] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [error, setError] = useState("");
  const [bitacoras, setBitacoras] = useState([]);
  const [loadingBitacoras, setLoadingBitacoras] = useState(false);
  const [showNewBitacora, setShowNewBitacora] = useState(false);
  const [showPago, setShowPago] = useState(false);

  const formatoLempiras = (valor: number) =>
  valor.toLocaleString("es-HN", { style: "currency", currency: "HNL" });

  const buscarCliente = async () => {
    setError("");
    setCliente(null);
    setBitacoras([]);
    //Validar si el campo está vacío
    if (!rtn.trim()) {
      setError("Debe ingresar un RTN para buscar.");
      return;
    }
    try {
      const res = await fetch(`/api/clientes?rtn=${rtn}`);
      const data = await res.json();

      if (data.code === 200 && data.results.length > 0) {
        setCliente(data.results[0]);
      } else {
        setError("Cliente no encontrado.");
      }
    } catch (err) {
      setError("Ocurrió un error al buscar el cliente.");
    }
  };

  useEffect(() => {
    const fetchBitacoras = async () => {
      if (!cliente?.id) return;
      setLoadingBitacoras(true);
      try {
        const res = await fetch(`/api/bitacoras/${cliente.id}`);
        const data = await res.json();
        setBitacoras(data.results);
      } catch (err) {
        console.error("Error al cargar bitácoras", err);
      } finally {
        setLoadingBitacoras(false);
      }
    };

    fetchBitacoras();
  }, [cliente]);


  return (
    <div className="w-full p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800">Gestión de Bitácoras</h1>
      <h2 className="text-xl font-bold mb-4">Buscar Cliente por RTN</h2>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Ingrese RTN"
          value={rtn}
          maxLength={14}
          onChange={(e) => {
            const soloNumeros = e.target.value.replace(/\D/g, ""); //elimina todo lo que no sea número
            setRtn(soloNumeros);
          }}
          className="border p-2 w-full rounded"
        />

      </div>
      <button
        onClick={buscarCliente}
        className="flex mb-6 bg-[#295d0c] text-white px-5 py-3 rounded-md hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
      >
        <Search className="w-5 h-5" />
        Buscar
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {cliente && (
        <>
          <div className="p-1 border rounded bg-gray-50 flex justify-between">
            {/* Columna izquierda */}
            <div className="flex flex-col space-y-2 text-left">
              <p><strong>DATOS DEL CLIENTE</strong></p>
              <p><strong>Empresa:</strong> {cliente.empresa}</p>
              <p><strong>Responsable:</strong> {cliente.responsable}</p>
              <p><strong>RTN:</strong> {cliente.rtn}</p>
              <p><strong>Dirección:</strong> {cliente.direccion}</p>
              <p><strong>Telefono:</strong> {cliente.telefono}</p>
              <p><strong>Correo:</strong> {cliente.correo}</p>
            </div>

            {/* Columna derecha */}
            <div className="flex flex-col space-y-2 text-right">
              <p><strong>HORAS - SALDOS</strong></p>
              <p><strong>Paquetes:</strong> {cliente.horas_paquetes} - {formatoLempiras(cliente.monto_paquetes)}</p>
              <p><strong>Individuales:</strong> {cliente.horas_individuales} - {formatoLempiras(cliente.monto_individuales)}</p>
              {/* Total horas y montos */}
              <p className="mt-4 border-t pt-2 font-semibold">
                <strong>Total:</strong> {cliente.horas_paquetes + cliente.horas_individuales} 
                - {formatoLempiras(cliente.monto_paquetes + cliente.monto_individuales)}
              </p>
            </div>
          </div>

          {/* Bitácoras */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">BITÁCORAS</h3>
          <div className="space-x-2">
            <button 
            onClick={() => setShowNewBitacora(true)}
            className="px-3 py-1 bg-[#2e3763] text-white rounded-md hover:bg-[#252a50]">
              Nueva
            </button>
            <button 
            onClick={() => setShowPago(true)}
            className="px-3 py-1 bg-[#4d152c] text-white rounded-md hover:bg-[#3e1024]">
              Pago
            </button>
          </div>
        </div>
        {showNewBitacora && cliente && (
          <FormNuevaBitacora
            clienteId={cliente.id}
            onClose={() => setShowNewBitacora(false)}
            onGuardar={() => buscarCliente()} // Para recargar bitácoras luego de guardar
          />
        )}
        {showPago && cliente && (
          <ModalPago
            clienteId={cliente.id}
            onClose={() => setShowPago(false)}
            onGuardar={() => buscarCliente()} // recargar datos después de pagar
          />
        )}

            {loadingBitacoras ? (
              <p className="text-gray-600">Cargando bitácoras...</p>
            ) : bitacoras.length === 0 ? (
              <p className="text-gray-500">Este cliente no tiene bitácoras registradas.</p>
            ) : (
              <div className="space-y-4">
                {bitacoras.map((b: any) => (
                  <div key={b.id} className="border p-4 rounded shadow bg-white">
                    <p><strong>Fecha:</strong> {new Date(b.fecha_servicio).toLocaleDateString()}</p>
                    <p><strong>Tipo de Servicio:</strong> {b.tipo_servicio}</p>
                    <p><strong>Descripción:</strong> {b.descripcion_servicio}</p>
                    <p><strong>Horas:</strong> {b.horas_consumidas} ({b.tipo_horas})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BuscarCliente;

