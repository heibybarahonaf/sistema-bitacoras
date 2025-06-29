"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function FirmaClientePage() {
  const { token } = useParams();
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [firmaId, setFirmaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validarToken = async () => {
      try {
        const res = await fetch(`/api/firmas/validar/${token}`);
        const data = await res.json();

        if (!res.ok) {
        Swal.fire({
            icon: "error",
            title: "Enlace inválido",
            text: data.error || "El enlace ya expiró o no existe.",
            confirmButtonText: "OK",
        }).then(() => {
            window.location.href = "https://www.posdehonduras.com";
        });
        return;
        }
        
        const firma = data.results?.[0];

        if (!firma || !firma.id) {
          Swal.fire({
            icon: "error",
            title: "Enlace inválido",
            text: "El enlace ya expiró o no existe.",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.href = "https://www.posdehonduras.com";
          });
          return;
        }

        setFirmaId(firma.id);

        
      } catch (error) {
        console.error("Error al validar token", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) validarToken();
  }, [token, router]);

  const handleSubmit = async () => {
  if (!sigCanvas.current) {
    Swal.fire("Error", "El canvas de firma no está listo. Intenta recargar la página.", "error");
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
        window.location.href = "https://www.posdehonduras.com"; //encuesta? o mostrar de una vez
      });
    } else {
      Swal.fire("Error", "No se pudo guardar la firma", "error");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Error al enviar firma", "error");
  }
};

  if (loading) return <div className="p-8 text-center">Validando enlace...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-md p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Firma del Cliente</h2>
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
