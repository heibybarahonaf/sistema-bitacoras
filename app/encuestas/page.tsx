"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Pregunta {
  id: number;
  pregunta: string;
}

interface EncuestaActiva {
  id: number;
  titulo: string;
  descripcion: string;
  activa: boolean;
  preguntas: { id: number; texto?: string }[];
}

export default function CrearEncuestaPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activa, setActiva] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchDatosIniciales = async () => {
      try {
        // Traer todas las preguntas
        const resPreguntas = await axios.get("/api/preguntas");
        const dataPreguntas = resPreguntas.data.results[0];
        if (Array.isArray(dataPreguntas)) {
          setPreguntas(dataPreguntas);
        }

        // Traer encuesta activa
        const resEncuesta = await axios.get("/api/encuestas/activa");
        const encuesta: EncuestaActiva = resEncuesta.data.results[0];
        if (encuesta) {
          setTitulo(encuesta.titulo);
          setDescripcion(encuesta.descripcion);
          setActiva(encuesta.activa);
          setSeleccionadas(encuesta.preguntas.map((p) => p.id));
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales", error);
      }
    };

    fetchDatosIniciales();
  }, []);

  const toggleSeleccion = (id: number) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((pid) => pid !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  const crearEncuesta = async () => {
    if (!titulo.trim() || !descripcion.trim() || seleccionadas.length === 0) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      await axios.post("/api/encuestas", {
        titulo,
        descripcion,
        activa,
        preguntas: seleccionadas,
      });
      setMensaje("Encuesta creada con éxito");
      // Limpiar solo si quieres crear nueva, sino dejar para edición
      // setTitulo("");
      // setDescripcion("");
      // setSeleccionadas([]);
      // setActiva(false);
    } catch (error: any) {
      setMensaje(error?.response?.data?.message || "Error al crear la encuesta");
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestionar Encuesta</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Título de la encuesta"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <textarea
          placeholder="Descripción de la encuesta"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
            <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            />
            Activar encuesta
        </label>
        <Link
            href="/preguntas"
            className="text-sm text-blue-600 hover:underline border px-3 py-1 rounded"
        >
            + Crear Pregunta
        </Link>
        </div>

      </div>

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">Selecciona las preguntas</h2>
      <ul className="space-y-2">
        {preguntas.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={seleccionadas.includes(p.id)}
              onChange={() => toggleSeleccion(p.id)}
            />
            <span>{p.pregunta}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          onClick={crearEncuesta}
          disabled={cargando}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Guardar
        </button>
        {mensaje && <p className="mt-2 text-blue-600">{mensaje}</p>}
      </div>
    </div>
  );
}
