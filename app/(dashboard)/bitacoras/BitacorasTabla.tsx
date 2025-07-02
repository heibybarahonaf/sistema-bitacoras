"use client";

import React, { useEffect, useState } from "react";

type BitacoraTabla = {
  id: number;
  no_ticket: string;
  fecha_servicio: string; 
  tipo_servicio: string;
  descripcion_servicio: string;
};

export function BitacorasTabla({ clienteId }: { clienteId: number }) {
  const [bitacoras, setBitacoras] = useState<BitacoraTabla[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clienteId) return;

    setLoading(true);
    fetch(`/api/bitacoras?clienteId=${clienteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          setBitacoras(data.data);
        } else {
          setBitacoras([]);
        }
      })
      .finally(() => setLoading(false));
  }, [clienteId]);

  if (loading) return <p>Cargando bitácoras...</p>;
  if (bitacoras.length === 0) return <p>No hay bitácoras para este cliente.</p>;

  return (
    <table className="w-full border border-gray-300 border-collapse">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2">No. Ticket</th>
          <th className="border border-gray-300 p-2">Fecha Servicio</th>
          <th className="border border-gray-300 p-2">Tipo Servicio</th>
          <th className="border border-gray-300 p-2">Descripción</th>
        </tr>
      </thead>
      <tbody>
        {bitacoras.map((b) => (
          <tr key={b.id}>
            <td className="border border-gray-300 p-2">{b.no_ticket}</td>
            <td className="border border-gray-300 p-2">{new Date(b.fecha_servicio).toLocaleDateString()}</td>
            <td className="border border-gray-300 p-2">{b.tipo_servicio}</td>
            <td className="border border-gray-300 p-2">{b.descripcion_servicio}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
