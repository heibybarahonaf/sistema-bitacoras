"use client";

import Swal from "sweetalert2";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type Pregunta = {
  id: number;
  texto: string;
};

const EncuestaPage = () => {
  const { id } = useParams();
  const bitacoraId = Number(id);

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});

  useEffect(() => {
    const obtenerPreguntas = async () => {
      const res = await fetch("/api/encuestas/activa");
      const data = await res.json();
      if (data?.results?.length) {
        setPreguntas(data.results[0].preguntas);
      }
    };
    obtenerPreguntas();
  }, []);

  const manejarRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
  };

  const puntajeTotal = Object.values(respuestas).reduce((acc, val) => acc + val, 0);
  const totalPreguntas = preguntas.length;
  const calificacionBase5 = totalPreguntas > 0 ? puntajeTotal / totalPreguntas : 0;
  const calificacionBase10 = calificacionBase5 * 2;

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(bitacoraId)) {
      alert("No se encontró el ID de la bitácora.");
      return;
    }

    try {
      const res = await fetch(`/api/bitacoras/${bitacoraId}/calificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calificacion: Math.round(calificacionBase10),
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Calificación enviada con éxito",
          text: "¡Gracias!",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "https://www.posdehonduras.com";
        });
      } else {
        alert("Error al enviar la calificación.");
      }
    } catch (error) {
      alert("Error al enviar la calificación.");
    }
  };

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

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
          disabled={Object.keys(respuestas).length !== totalPreguntas}
          title={Object.keys(respuestas).length !== totalPreguntas ? "Responde todas las preguntas para enviar" : ""}
        >
          Enviar respuestas
        </button>
      </form>
    </div>
  );
};

export default EncuestaPage;
