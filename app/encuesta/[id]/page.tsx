"use client";

import Swal from "sweetalert2";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";

type Pregunta = { id: number; texto: string };

const EncuestaPage = () => {
  const { id } = useParams();
  const bitacoraId = Number(id);

  const storageKey = `encuesta_bitacora_${bitacoraId}`;
  const storageDoneKey = `encuesta_bitacora_${bitacoraId}_done`;

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [yaContestado, setYaContestado] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(storageDoneKey);
    if (done === "true") {
      setYaContestado(true);
      setCargando(false);
      return;
    }

    const respuestasGuardadas = localStorage.getItem(storageKey);
    if (respuestasGuardadas) {
      try {
        setRespuestas(JSON.parse(respuestasGuardadas));
      } catch {}
    }

    const obtenerPreguntas = async () => {
      try {
        const res = await fetch("/api/encuestas/activa");
        const data = await res.json();
        if (data?.results?.length) {
          setPreguntas(data.results[0].preguntas);
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar las preguntas de la encuesta.",
        });
      } finally {
        setCargando(false);
      }
    };

    obtenerPreguntas();
  }, [storageDoneKey, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!yaContestado && Object.keys(respuestas).length > 0 && !enviando) {
        e.preventDefault();
        e.returnValue = "¿Estás seguro de salir sin enviar las respuestas?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [respuestas, yaContestado, enviando]);

  useEffect(() => {
    if (Object.keys(respuestas).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(respuestas));
    }
  }, [respuestas, storageKey]);

  const manejarRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const totalPreguntas = preguntas.length;
  const puntajeTotal = Object.values(respuestas).reduce((acc, val) => acc + val, 0);
  const calificacionBase5 = totalPreguntas > 0 ? puntajeTotal / totalPreguntas : 0;
  const calificacionBase10 = calificacionBase5 * 2;
  const encuestaCompleta = !cargando && totalPreguntas > 0 && Object.keys(respuestas).length === totalPreguntas;

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!encuestaCompleta) {
      Swal.fire({
        icon: "warning",
        title: "Por favor responde todas las preguntas",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Estás seguro de enviar las respuestas?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    if (isNaN(bitacoraId)) {
      alert("No se encontró el ID de la bitácora.");
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`/api/bitacoras/${bitacoraId}/calificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacion: Math.round(calificacionBase10) }),
      });

      if (res.ok) {
        localStorage.setItem(storageDoneKey, "true");
        localStorage.removeItem(storageKey);
        window.location.href = "https://www.posdehonduras.com";
      } else {
        alert("Error al enviar la calificación.");
      }
    } catch {
      alert("Error al enviar la calificación.");
    } finally {
      setEnviando(false);
    }
  };

  const reiniciarEncuesta = () => {
    Swal.fire({
      title: "¿Deseas reiniciar la encuesta?",
      text: "Se borrarán todas las respuestas seleccionadas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, reiniciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setRespuestas({});
        localStorage.removeItem(storageKey);
      }
    });
  };

  if (cargando) {
    return <div className="text-center p-6">Cargando encuesta...</div>;
  }

  if (yaContestado) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-green-700 font-semibold">
        <h2 className="text-2xl mb-4">Encuesta ya contestada</h2>
        <p>Gracias por tu participación. Ya has enviado esta encuesta anteriormente.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 pb-16">
      <h1 className="text-3xl font-bold mb-4">Encuesta de Satisfacción</h1>

      <section className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
        <p className="mb-1">
          Esta encuesta nos ayuda a mejorar nuestro servicio. Por favor, responde cada pregunta calificando del 1 al 5:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>1 = Muy insatisfecho</li>
          <li>2 = Insatisfecho</li>
          <li>3 = Neutral</li>
          <li>4 = Satisfecho</li>
          <li>5 = Muy satisfecho</li>
        </ul>
      </section>

      <form onSubmit={manejarSubmit} className="space-y-6">
        {preguntas.map((p) => (
          <div key={p.id} className="border rounded p-4 shadow-sm">
            <p className="font-medium mb-2">{p.texto}</p>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((valor) => (
                <label key={valor} className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="radio"
                    name={`pregunta_${p.id}`}
                    value={valor}
                    checked={respuestas[p.id] === valor}
                    onChange={() => manejarRespuesta(p.id, valor)}
                    className="accent-blue-600"
                    required
                  />
                  {valor}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!encuestaCompleta || enviando}
            title={!encuestaCompleta ? "Responde todas las preguntas para enviar" : ""}
            className={`flex items-center justify-center gap-2 font-semibold py-2 px-6 rounded transition 
              ${!encuestaCompleta || enviando
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {enviando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={reiniciarEncuesta}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition"
          >
            <RotateCcw className="w-5 h-5" />
            Reiniciar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EncuestaPage;
