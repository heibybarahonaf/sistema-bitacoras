"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Configuracion {
  correo_ventas: string;
  comision: number;
  valor_hora_individual: number;
  valor_hora_paquete: number;
}

export default function ConfiguracionPage() {
  const [form, setForm] = useState<Configuracion>({
    correo_ventas: "",
    comision: 0,
    valor_hora_individual: 0,
    valor_hora_paquete: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function obtenerConfiguracion() {
      try {
        const res = await fetch("/api/configuracion/1");
        if (!res.ok) throw new Error("Error al obtener configuración");
        const data = await res.json();

        if (data.code === 200 && data.results?.length > 0) {
          const config = data.results[0];
          // Asegurarse de que los campos numéricos sean números
          setForm({
            correo_ventas: config.correo_ventas ?? "",
            comision: Number(config.comision) || 0,
            valor_hora_individual: Number(config.valor_hora_individual) || 0,
            valor_hora_paquete: Number(config.valor_hora_paquete) || 0,
          });
        } else {
          Swal.fire("Info", "No se encontró configuración, usando valores por defecto", "info");
        }
      } catch (error: any) {
        Swal.fire("Error", error.message || "Error al cargar configuración", "error");
      } finally {
        setLoading(false);
      }
    }

    obtenerConfiguracion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "correo_ventas"
          ? value
          : value === ""
          ? 0
          : Number(value), // Convertir a número o 0 si vacío
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      const res = await fetch("/api/configuracion/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.code !== 200) {
        throw new Error(data.message || "Error al guardar configuración");
      }

      Swal.fire("Guardado", "Configuración actualizada con éxito", "success");
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al guardar configuración", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración del Sistema
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700">
            Correo de ventas
          </label>
          <input
            type="email"
            name="correo_ventas"
            value={form.correo_ventas}
            onChange={handleChange}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">% Comisión</label>
          <input
            type="number"
            name="comision"
            value={form.comision}
            onChange={handleChange}
            min={0}
            step="any"
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">
            Valor hora individual (Lps)
          </label>
          <input
            type="number"
            name="valor_hora_individual"
            value={form.valor_hora_individual}
            onChange={handleChange}
            min={0}
            step="any"
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">
            Valor hora por paquete (Lps)
          </label>
          <input
            type="number"
            name="valor_hora_paquete"
            value={form.valor_hora_paquete}
            onChange={handleChange}
            min={0}
            step="any"
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`text-white font-semibold px-4 py-2 rounded ${
              saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}

