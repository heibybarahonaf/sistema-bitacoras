"use client";

import axios from "axios";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface Pregunta {
  id: number;
  pregunta: string;
}

interface EncuestaActiva {
  id: number;
  titulo: string;
  descripcion: string;
  activa: boolean;
  preguntas: { id: number; texto: string }[];
}

export default function CrearEncuestaPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [encuestaId, setEncuestaId] = useState<number | null>(null);
  const [preguntasAsociadas, setPreguntasAsociadas] = useState<Pregunta[]>([]);
  const [preguntasDisponibles, setPreguntasDisponibles] = useState<Pregunta[]>([]);

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [descripcion, setDescripcion] = useState("");

  // Estado para mostrar toast
  const [toast, setToast] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  useEffect(() => {

    const fetchDatosIniciales = async () => {
      try {
        const [resPreguntas, resEncuesta] = await Promise.all([
          axios.get("/api/preguntas"),
          axios.get("/api/encuestas/activa"),
        ]);

        const preguntasData: Pregunta[] = resPreguntas.data.results[0];
        const encuesta: EncuestaActiva = resEncuesta.data.results[0];

        if (!Array.isArray(preguntasData)) return;

        if (encuesta) {
          setEncuestaId(encuesta.id);
          setTitulo(encuesta.titulo);
          setDescripcion(encuesta.descripcion);

          if (!encuesta.preguntas || encuesta.preguntas.length === 0) {
            setMensaje("⚠️ La encuesta activa no tiene preguntas asociadas.");
          }

          const asociadas: Pregunta[] = (encuesta.preguntas || []).map((p) => ({
            id: p.id,
            pregunta: p.texto,
          }));

          setPreguntasAsociadas(asociadas);

          const idsAsociadas = new Set(asociadas.map((a) => a.id));
          const disponibles = preguntasData.filter((p) => !idsAsociadas.has(p.id));
          setPreguntasDisponibles(disponibles);
          setPreguntas(preguntasData);

        } else {

          setPreguntas(preguntasData);
          setPreguntasAsociadas([]);
          setPreguntasDisponibles(preguntasData);

        }
      } catch {
        setMensaje("Error al cargar datos iniciales");
      }
    };

    fetchDatosIniciales();
  }, []);

  const mostrarToast = (tipo: "exito" | "error", texto: string) => {
    setToast({ tipo, texto });
    setTimeout(() => setToast(null), 4000);
  };

  const guardarCambios = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      mostrarToast("error", "Título y descripción son obligatorios.");
      return;
    }

    setCargando(true);

    try {

      if (encuestaId) {
        await axios.patch(`/api/encuestas/${encuestaId}`, {
          titulo,
          descripcion,
          preguntas: preguntasAsociadas.map((p) => p.id),
        });

        mostrarToast("exito", "Encuesta actualizada con éxito");

      } else {
        
        const res = await axios.post("/api/encuestas", {
          titulo,
          descripcion,
          activa: true,
          preguntas: preguntasAsociadas.map((p) => p.id),
        });

        setEncuestaId(res.data.id);
        mostrarToast("exito", "Encuesta creada con éxito");

      }
    } catch (error: any) {
      mostrarToast("error", error?.response?.data?.message || "Error al guardar encuesta");
    } finally {
      setCargando(false);
    }
  };

  const agregarPregunta = (pregunta: Pregunta) => {
    setPreguntasAsociadas((prev) => [...prev, pregunta]);
    setPreguntasDisponibles((prev) => prev.filter((p) => p.id !== pregunta.id));
  };

  const quitarPregunta = (pregunta: Pregunta) => {
    setPreguntasDisponibles((prev) => [...prev, pregunta]);
    setPreguntasAsociadas((prev) => prev.filter((p) => p.id !== pregunta.id));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mb-24 relative">
      <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <FileText className="w-8 h-8 text-[#295d0c]" />
        Gestión de Encuesta
      </h1>

      <div className="space-y-4">
        <h2 className="font-semibold mb-2">Título</h2>
        <input
          type="text"
          placeholder="Título de la encuesta"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <h2 className="font-semibold mb-2">Descripción</h2>
        <textarea
          placeholder="Descripción de la encuesta"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex items-center justify-between">
          <Link
            href="/preguntas"
            className="text-sm text-blue-600 hover:underline border px-3 py-1 rounded"
          >
            + Crear Pregunta
          </Link>
        </div>
      </div>

      <hr className="my-6" />

      <div className="flex gap-6 text-sm">
        <div className="w-1/2">
          <h2 className="font-semibold mb-2">Preguntas asociadas</h2>
          {preguntasAsociadas.length === 0 && <p>No hay preguntas asociadas</p>}
          <ul>
            {preguntasAsociadas.map((p) => (
              <li key={p.id} className="flex justify-between items-center border p-2 rounded mb-1">
                <span>{p.pregunta}</span>
                <button
                  onClick={() => quitarPregunta(p)}
                  disabled={cargando}
                  className="text-red-600 hover:underline"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-1/2 text-sm">
          <h2 className="font-semibold mb-2">Preguntas disponibles</h2>
          {preguntasDisponibles.length === 0 && <p>No hay preguntas disponibles</p>}
          <ul>
            {preguntasDisponibles.map((p) => (
              <li key={p.id} className="flex justify-between items-center border p-2 rounded mb-1">
                <span>{p.pregunta}</span>
                <button
                  onClick={() => agregarPregunta(p)}
                  disabled={cargando}
                  className="text-green-600 hover:underline"
                >
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={guardarCambios}
          disabled={cargando}
          className="bg-[#295d0c] text-white px-5 py-2 rounded hover:bg-[#23480a]"
        >
          Guardar
        </button>
      </div>

      {/* Toast personalizado */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${
            toast.tipo === "exito" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.texto}
        </div>
      )}
    </div>
  );
}
