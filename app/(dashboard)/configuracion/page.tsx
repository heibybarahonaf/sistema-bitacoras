"use client";

import Swal from "sweetalert2";
import { Cog } from "lucide-react";
import { useEffect, useState } from "react";
import { Tipo_Servicio, Fase_Implementacion } from "@prisma/client";

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
  const [servicios, setServicios] = useState<Tipo_Servicio[]>([]);
  const [fases, setFases] = useState<Fase_Implementacion[]>([]);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {

    try {
      // Obtener tipos de servicio
      const resServicios = await fetch("/api/tipo-servicio");
      const dataServicios = await resServicios.json();
      
      if (
        resServicios.ok &&
        dataServicios.code === 200 &&
        Array.isArray(dataServicios.results)
      ) {
        setServicios(dataServicios.results);
      }

      // Obtener fases de implementación
      const resFases = await fetch("/api/fase-implementacion");
      const dataFases = await resFases.json();
      if (
        resFases.ok &&
        dataFases.code === 200 &&
        Array.isArray(dataFases.results)
      ) {
        setFases(dataFases.results);
      }

      // Obtener configuración general
      const res = await fetch("/api/configuracion/1");
      const data = await res.json();
      if (!res.ok) throw new Error("Error al obtener configuración");

      if (data.code === 200 && data.results?.length > 0) {

        const config = data.results[0];
        setForm({
          correo_ventas: config.correo_ventas ?? "",
          comision: Number(config.comision) || 0,
          valor_hora_individual: Number(config.valor_hora_individual) || 0,
          valor_hora_paquete: Number(config.valor_hora_paquete) || 0,
        });

      } else {

        Swal.fire(
          "Info",
          "No se encontró configuración, usando valores por defecto",
          "info"
        );

      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "correo_ventas" ? value : value === "" ? 0 : Number(value),
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

  // --- Tipos de Servicio ---

  const mostrarFormularioTipoServicio = async (servicio?: Tipo_Servicio) => {

    const isEdit = !!servicio;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? "Editar Tipo de Servicio" : "Nuevo Tipo de Servicio",
      html:
        `<input id="tipoServicio" class="swal2-input" placeholder="Tipo de servicio" maxlength="50" value="${
          servicio?.tipo_servicio ?? ""
        }">` +
        `<input id="descripcionServicio" class="swal2-input" placeholder="Descripción" maxlength="100" value="${
          servicio?.descripcion ?? ""
        }">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Guardar cambios" : "Guardar",
      preConfirm: () => {
        const tipo = (document.getElementById("tipoServicio") as HTMLInputElement)
          ?.value.trim();
        const descripcion = (document.getElementById("descripcionServicio") as HTMLInputElement)
          ?.value.trim();

        if (!tipo || !descripcion) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return null;
        }

        return { tipo_servicio: tipo, descripcion };
      },
    });

    if (formValues) {
      try {
        const url = isEdit ? `/api/tipo-servicio/${servicio!.id}` : "/api/tipo-servicio";
        const method = isEdit ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formValues,
            activo: servicio?.activo ?? true,
          }),
        });

        const data = await res.json();
        if (res.ok && (data.code === 200 || data.code === 201)) {
          await obtenerDatos();
          Swal.fire(
            "Guardado",
            `Tipo de servicio ${isEdit ? "actualizado" : "creado"} con éxito`,
            "success"
          );

        } else {
          throw new Error(data.message || "No se pudo completar la acción");
        }

      } catch (error: any) {
        Swal.fire("Error", error.message || "Error inesperado", "error");
      }
    }
  };

  const toggleActivoTipoServicio = async (servicio: Tipo_Servicio) => {

    try {
      const res = await fetch(`/api/tipo-servicio/${servicio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !servicio.activo }),
      });

      const data = await res.json();
      if (res.ok && data.code === 200) {
        await obtenerDatos();
      } else {
        throw new Error(data.message || "No se pudo cambiar el estado");
      }

    } catch (error: any) {
      Swal.fire("Error", error.message || "Error inesperado", "error");
    }
  };

  // --- Fases de Implementación ---

  const mostrarFormularioFase = async (fase?: Fase_Implementacion) => {

    const isEdit = !!fase;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? "Editar Fase de Implementación" : "Nueva Fase de Implementación",
      html:
        `<input id="faseImplementacion" class="swal2-input" placeholder="Fase" maxlength="50" value="${
          fase?.fase ?? ""
        }">` +
        `<input id="descripcionFase" class="swal2-input" placeholder="Descripción" maxlength="100" value="${
          fase?.descripcion ?? ""
        }">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? "Guardar cambios" : "Guardar",
      preConfirm: () => {
        const faseInput = (document.getElementById("faseImplementacion") as HTMLInputElement)
          ?.value.trim();
        const descripcion = (document.getElementById("descripcionFase") as HTMLInputElement)
          ?.value.trim();

        if (!faseInput || !descripcion) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return null;
        }

        return { fase: faseInput, descripcion };
      },
    });

    if (formValues) {

      try {
        const url = isEdit
          ? `/api/fase-implementacion/${fase!.id}`
          : "/api/fase-implementacion";
        const method = isEdit ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formValues,
            activa: fase?.activa ?? true,
          }),
        });

        const data = await res.json();
        if (res.ok && (data.code === 200 || data.code === 201)) {
          await obtenerDatos();
          Swal.fire(
            "Guardado",
            `Fase de implementación ${isEdit ? "actualizada" : "creada"} con éxito`,
            "success"
          );

        } else {
          throw new Error(data.message || "No se pudo completar la acción");
        }
        
      } catch (error: any) {
        Swal.fire("Error", error.message || "Error inesperado", "error");
      }
    }
  };

  const toggleActivoFase = async (fase: Fase_Implementacion) => {

    try {
      const res = await fetch(`/api/fase-implementacion/${fase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !fase.activa }),
      });

      const data = await res.json();
      if (res.ok && data.code === 200) {
        await obtenerDatos();
      } else {
        throw new Error(data.message || "No se pudo cambiar el estado");
      }

    } catch (error: any) {
      Swal.fire("Error", error.message || "Error inesperado", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Cargando configuración...</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-sm mt-10 mb-24 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <Cog className="w-8 h-8 text-[#295d0c]" />
        Configuración del Sistema
      </h1>

      {/* Formulario de configuración general */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700">Correo de ventas</label>
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
            Valor hora individual (Lps) <span className="text-red-500"><strong>* Sin ISV</strong></span>
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
          Valor hora por paquete (Lps) <span className="text-red-500"><strong>* Sin ISV</strong></span>
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
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </form>

      {/* Tipos de Servicio */}
      <hr className="my-8" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Tipos de Servicio</h3>
        <button
          onClick={() => mostrarFormularioTipoServicio()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Agregar
        </button>
      </div>

      <ul className="mt-6 space-y-2 pb-10">
        {servicios.map((s) => (
          <li
            key={s.id}
            className="border px-3 py-2 rounded bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div>
              <strong>{s.tipo_servicio}</strong>{" "}
              {s.activo ? (
                <span className="text-green-600 text-sm">(Activo)</span>
              ) : (
                <span className="text-red-600 text-sm">(Inactivo)</span>
              )}
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => mostrarFormularioTipoServicio(s)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => toggleActivoTipoServicio(s)}
                className={`px-3 py-1 rounded text-sm text-white ${
                  s.activo
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {s.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Fases de Implementación */}
      <hr className="my-8" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Fases de Implementación</h3>
        <button
          onClick={() => mostrarFormularioFase()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Agregar
        </button>
      </div>

      <ul className="mt-6 space-y-2 pb-10">
        {fases.map((f) => (
          <li
            key={f.id}
            className="border px-3 py-2 rounded bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div>
              <strong>{f.fase}</strong>{" "}
              {f.activa ? (
                <span className="text-green-600 text-sm">(Activo)</span>
              ) : (
                <span className="text-red-600 text-sm">(Inactivo)</span>
              )}
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => mostrarFormularioFase(f)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => toggleActivoFase(f)}
                className={`px-3 py-1 rounded text-sm text-white ${
                  f.activa
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {f.activa ? "Desactivar" : "Activar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
