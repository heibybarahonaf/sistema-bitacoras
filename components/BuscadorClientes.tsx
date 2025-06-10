"use client";
import { useState } from "react";

export function BuscadorClientes({ onSelect }: { onSelect: (cliente: any) => void }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);

  const buscar = async () => {
    const res = await fetch(`/api/clientes?q=${query}`);
    const data = await res.json();
    setResultados(data);
  };

  return (
    <div className="space-y-2">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar empresa o responsable"
          className="border p-2 rounded-l w-full"
        />
        <button onClick={buscar} className="bg-green-700 text-white px-4 rounded-r">
          Buscar
        </button>
      </div>

      {resultados.length > 0 && (
        <ul className="border rounded p-2 max-h-40 overflow-y-auto bg-white">
          {resultados.map((cliente: any) => (
            <li
              key={cliente.id}
              className="p-2 hover:bg-green-100 cursor-pointer"
              onClick={() => onSelect(cliente)}
            >
              {cliente.empresa} - {cliente.responsable}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
