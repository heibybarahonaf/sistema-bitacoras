"use client";

import Swal from "sweetalert2";
import { useRef, useEffect, useState } from "react";
import { Usuario } from "@prisma/client";
import SignatureCanvas from "react-signature-canvas";
import { User } from "lucide-react";

export default function PerfilUsuarioPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [firmaImg, setFirmaImg] = useState<string | null>(null);
  const firmaRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    async function fetchUsuarioLogueado() {
      try {
        const res = await fetch("/api/auth/obtener-sesion", { credentials: "include" });
        const data = await res.json();

        if (data.code === 200 && data.results?.length > 0) {
          setUsuario(data.results[0]);
          cargarFirma(data.results[0].id);
        } else {
          Swal.fire("Error", "No se pudo obtener el usuario logueado.", "error");
        }
      } catch {
        Swal.fire("Error", "Error al conectar con el servidor.", "error");
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
    } catch {
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

    const width = canvas.width;
    const height = canvas.height;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    img.src = firmaImg;
  }, [firmaImg]);

  async function handleGuardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!usuario) return;

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    // Objeto para actualizar solo campos que cambian
    const usuarioActualizado: any = {};

    if (password && password.trim() !== "") {
      usuarioActualizado.password = password;
    }

    try {
      // Actualizar password si existe
      if (Object.keys(usuarioActualizado).length > 0) {
        const res = await fetch(`/api/usuarios/${usuario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuarioActualizado),
        });

        const data = await res.json();

        if (!res.ok || (data.code !== 200 && data.code !== 201)) {
          Swal.fire("Error", data.message || "Error al actualizar usuario", "error");
          return;
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

      Swal.fire("¡Listo!", "Perfil actualizado correctamente", "success");
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al conectar con el servidor", "error");
    }
  }

  if (!usuario) return null;

  return (
    <form onSubmit={handleGuardar} className="space-y-4 mb-4 max-w-md mx-auto p-4 bg-white rounded shadow">
      <div>
        <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
          <User className="w-8 h-8 text-[#295d0c]" />
          Perfil
        </h1>

        <label className="block font-medium mb-1" htmlFor="nombre">
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={usuario.nombre}
          disabled
          className="input w-full bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block font-medium mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Dejar en blanco para no cambiar"
          className="input w-full"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Firma</label>
        <div className="flex justify-center mb-2">
          <SignatureCanvas
            ref={firmaRef}
            penColor="black"
            canvasProps={{
              width: 350,
              height: 100,
              className: "border border-gray-300 rounded-md shadow-sm bg-white",
              style: { width: "350px", height: "100px" },
            }}
          />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (firmaRef.current) {
                firmaRef.current.clear();
                setFirmaImg(null);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
          >
            Limpiar firma
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="px-5 py-2 rounded-md bg-[#295d0c] text-sm text-white font-semibold hover:bg-[#23480a]"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
