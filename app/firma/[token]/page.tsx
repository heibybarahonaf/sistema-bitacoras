"use client";

import Swal from "sweetalert2";
import { Bitacora } from "@prisma/client";
import { useParams } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import { useEffect, useRef, useState } from "react";

export default function FirmaClientePage() {
  const { token } = useParams();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [firmaId, setFirmaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [bitacora, setBitacora] = useState<Bitacora | null>(null);
  const [nombreTecnico, setNombreTecnico] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  useEffect(() => {
    const validarToken = async () => {
      try {
        const res = await fetch(`/api/firmas/validar/${token}`);
        const data = await res.json();

        if (!res.ok || !data.results?.[0]) {
          Swal.fire({
            icon: "error",
            title: "Enlace inválido",
            text: data.error || "El enlace ya ha sido utilizado.",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.href = "https://www.posdehonduras.com";
          });
          return;
        }

        const firma = data.results[0];
        setFirmaId(firma.id);

        // Obtener la bitácora relacionada
        const resBitacora = await fetch(`/api/bitacoras/por-firma/${firma.id}`);
        const dataBitacora = await resBitacora.json();

        if (resBitacora.ok && dataBitacora?.result) {
          const bitacoraData = dataBitacora.result;
          setBitacora(bitacoraData);

          // Obtener nombre del técnico
          try {
            const resUsuario = await fetch(
              `${baseUrl}/api/usuarios/${bitacoraData.usuario_id}`
            );
            const dataUsuario = await resUsuario.json();
            if (resUsuario.ok && dataUsuario?.results?.[0]?.nombre) {
              setNombreTecnico(dataUsuario.results[0].nombre);
            }
          } catch (error) {
            console.error("Error al obtener el nombre del técnico:", error);
          }

        } else {
          setBitacora(null);
        }

      } catch (error) {
        console.error("Error al validar token", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) validarToken();
  }, [baseUrl, token]);

  const handleSubmit = async () => {
    if (!sigCanvas.current) {
      Swal.fire(
        "Error",
        "El canvas de firma no está listo. Intenta recargar la página.",
        "error"
      );
      return;
    }

    const canvas = sigCanvas.current;

    if (canvas.isEmpty()) {
      Swal.fire("Error", "Por favor firme antes de enviar", "warning");
      return;
    }

    const base64 = canvas.getCanvas().toDataURL("image/png");

    if (!firmaId) {
      Swal.fire("Error", "No se encontró un ID válido de firma", "error");
      return;
    }

    try {
      const res = await fetch("/api/firmas/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: firmaId, firma_base64: base64 }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Gracias!",
          text: "Tu firma ha sido registrada.",
          confirmButtonText: "OK",
        }).then(() => {
          if (bitacora?.id) {
            window.location.href = `/encuesta/${bitacora.id}`;
          } else {
            window.location.href = "/encuesta";
          }
        });
      } else {
        Swal.fire("Error", "No se pudo guardar la firma", "error");
      }
    } catch {
      Swal.fire("Error", "Error al enviar firma", "error");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Validando enlace...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-md p-6 w-full max-w-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">
          Detalles de la Bitácora
        </h2>
        {bitacora ? (
          <div className="space-y-2 text-gray-800">
            <p>
              <strong>No. Ticket:</strong> {bitacora.no_ticket}
            </p>
            <p>
              <strong>Fecha del Servicio:</strong>{" "}
              {new Date(bitacora.fecha_servicio).toLocaleDateString("es-HN")}
            </p>
            <p>
              <strong>Técnico:</strong>{" "}
              {nombreTecnico || `ID ${bitacora.usuario_id}`}
            </p>
            <p>
              <strong>Descripción:</strong> {bitacora.descripcion_servicio}
            </p>
            <p>
              <strong>Modalidad:</strong> {bitacora.modalidad}
            </p>
            <p>
              <strong>Horas Consumidas:</strong> {bitacora.horas_consumidas}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No se pudo cargar la información de la bitácora.
          </p>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-md p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          Firma del Cliente
        </h2>
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 200,
            className: "border border-gray-300 rounded w-full",
          }}
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={() => sigCanvas.current?.clear()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Limpiar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
