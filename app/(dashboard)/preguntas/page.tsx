"use client";

import axios from "axios";
import Link from "next/link";
import { Pregunta } from "@prisma/client";
import { useEffect, useState } from "react";

export default function PreguntasPage() {
  const [mensaje, setMensaje] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarPreguntas = async () => {

    try {

      const res = await axios.get("/api/preguntas");
      const data = res.data.results[0];

      if (Array.isArray(data)) {
        setPreguntas(data);
      }

    } catch {
      console.error("Error al obtener las preguntas");
    }
  };

  const guardarPregunta = async () => {
    if (!pregunta.trim()) return;
    setCargando(true);

    try {

      if (editandoId) {
        await axios.patch(`/api/preguntas/${editandoId}`, { pregunta });
        setMensaje("Pregunta actualizada");
      } else {
        await axios.post("/api/preguntas", { pregunta });
        setMensaje("Pregunta creada");
      }

      setPregunta("");
      setEditandoId(null);
      cargarPreguntas();
      
    } catch (error: any) {
      setMensaje(error?.response?.data?.message || "Error al guardar");
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const editar = (p: Pregunta) => {
    setPregunta(p.pregunta);
    setEditandoId(p.id);
  };

  const cancelar = () => {
    setPregunta("");
    setEditandoId(null);
  };

  useEffect(() => {
    cargarPreguntas();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
        <Link
            href="/encuestas"
            className="text-sm text-gray-500 hover:underline border px-3 py-1 rounded mb-4 inline-block"
        >
            ← Volver a Encuesta
        </Link>
      <h1 className="text-2xl font-bold mb-4">Gestión de Preguntas</h1>

      <div className="mb-4">
        <input
          type="text"
          className="border px-3 py-2 w-full rounded-md"
          placeholder="Ingrese la pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={guardarPregunta}
            disabled={cargando}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editandoId ? "Actualizar" : "Guardar"}
          </button>
          {editandoId && (
            <button
              onClick={cancelar}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
        {mensaje && <p className="text-sm mt-2 text-green-600">{mensaje}</p>}
      </div>

      <hr className="my-4" />

      <ul className="space-y-2">
        {preguntas.map((p) => {
          return (
            <li
              key={p.id}
              className="flex justify-between items-center border rounded p-3 hover:bg-gray-50"
            >
              <span>{p.pregunta}</span>
              <button
                onClick={() => editar(p)}
                className="text-sm text-blue-600 hover:underline"
              >
                Editar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
