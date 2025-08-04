"use client";

import Swal from "sweetalert2";
import { useRef, useEffect, useState } from "react";
import { Usuario } from "@prisma/client";
import SignatureCanvas from "react-signature-canvas";
import LoadingSpinner from "@/components/LoadingSpinner";
import { User, Lock, RefreshCw } from "lucide-react";

export default function PerfilUsuarioPage() {
  const firmaRef = useRef<SignatureCanvas | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [firmaImg, setFirmaImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsuarioLogueado() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/obtener-sesion", { credentials: "include" });
        const data = await res.json();

        if (data.code === 200 && data.results?.length > 0) {
          setUsuario(data.results[0]);
          await cargarFirma(data.results[0].id);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo obtener el usuario logueado",
            confirmButtonColor: "#295d0c",
          });
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor",
          confirmButtonColor: "#295d0c",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsuarioLogueado();
  }, []);

  async function cargarFirma(usuarioId: number) {
    try {
      const res = await fetch(`/api/firmas/tecnico/${usuarioId}`);
      const data = await res.json();

      if (data.code === 200 && data.results?.length > 0) {
        setFirmaImg(data.results[0].firma_base64);
      } else {
        setFirmaImg(null);
      }
    } catch (error) {
      setFirmaImg(null);
    }
  }

  // Escalar y pintar la firma en el canvas
  useEffect(() => {
    if (!firmaImg || !firmaRef.current) {
      firmaRef.current?.clear();
      return;
    }

    const canvas = firmaRef.current.getCanvas();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    img.src = firmaImg;
  }, [firmaImg]);

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!usuario || isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    if (password && password.trim() !== "" && password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 6 caracteres",
        confirmButtonColor: "#295d0c",
      });
      
      return;
    }

    setIsSubmitting(true);

    try {
      // Actualizar password si se proporcionó
      if (password && password.trim() !== "") {
        const res = await fetch(`/api/usuarios/${usuario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();
        if (!res.ok || (data.code !== 200 && data.code !== 201)) {
          throw new Error(data.message || "Error al actualizar contraseña");
        }
      }

      // Actualizar firma si hay dibujo
      if (firmaRef.current && !firmaRef.current.isEmpty()) {
        const firmaBase64 = firmaRef.current.toDataURL();
        const resFirma = await fetch(`/api/firmas/tecnico/${usuario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firma_base64: firmaBase64 }),
        });

        if (!resFirma.ok) {
          const errorData = await resFirma.json();
          throw new Error(errorData.message || "Error al guardar la firma");
        }
      }

      Swal.fire({
        icon: "success",
        title: "¡Perfil actualizado!",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#295d0c",
      }).then(() => {
        window.location.reload();
      });
      
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al guardar los cambios",
        confirmButtonColor: "#295d0c",
      });

    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner mensaje="Cargando perfil..."/>;
  }

  if (!usuario) {
    return (
      <div className="text-center py-8 text-gray-600">
        No se pudo cargar la información del usuario
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleGuardar} className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-[#295d0c]/10 rounded-full">
            <User className="w-6 h-6 text-[#295d0c]" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Perfil de Usuario</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={usuario.nombre}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Cambiar contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                min={6}
                placeholder="Mantener actual: dejar vacío"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#295d0c] focus:border-[#295d0c]"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 6 caracteres, puede incluir mayúsculas, minúsculas y números
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma digital
            </label>
            <div className="border border-gray-300 rounded-md p-2 bg-white">
              <SignatureCanvas
                ref={firmaRef}
                penColor="black"
                canvasProps={{
                  width: 350,
                  height: 150,
                  className: "w-full h-[150px] bg-white border border-gray-200 rounded",
                }}
              />
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (firmaRef.current) {
                    firmaRef.current.clear();
                    setFirmaImg(null);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#295d0c] text-white rounded-md shadow-sm hover:bg-[#23480a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#295d0c] disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}