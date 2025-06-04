"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  usuarioActual: any;
}

export default function ModalUsuario({
  isOpen,
  onClose,
  onSave,
  usuarioActual,
}: ModalUsuarioProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (usuarioActual) {
      reset({
        nombre: usuarioActual.nombre,
        correo: usuarioActual.correo,
        password: "", // dejar vacío por seguridad
        rol: usuarioActual.rol,
        zona_asignada: usuarioActual.zona_asignada,
        telefono: usuarioActual.telefono,
        activo: usuarioActual.activo,
      });
    } else {
      reset();
    }
  }, [usuarioActual, reset]);

  const onSubmit = async (data: any) => {
    // Esta parte se conecta a la API cuando esté lista
    console.log("Datos del formulario:", data);
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">
          {usuarioActual ? "Editar Usuario" : "Agregar Usuario"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Nombre</label>
            <input
              type="text"
              {...register("nombre", { required: "Nombre requerido" })}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
            {errors.nombre && <p className="text-red-600 text-sm">{"Ingrese nombre"}</p>}
          </div>

          <div>
            <label className="block font-medium">Correo</label>
            <input
              type="email"
              {...register("correo", {
                required: "Correo requerido",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Correo inválido",
                },
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
            {errors.correo && <p className="text-red-600 text-sm">{"Ingrese correo"}</p>}
          </div>

          <div>
            <label className="block font-medium">Contraseña</label>
            <input
              type="password"
              {...register("password", { required: !usuarioActual && "Contraseña requerida" })}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
            {errors.password && <p className="text-red-600 text-sm">{"Ingrese una contraseña"}</p>}
          </div>

          <div>
            <label className="block font-medium">Teléfono</label>
            <input
              type="text"
              {...register("telefono", {
                pattern: {
                  value: /^[0-9]{8,10}$/,
                  message: "Teléfono inválido",
                },
              })}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
            {errors.telefono && <p className="text-red-600 text-sm">{"Ingrese un telefono válido"}</p>}
          </div>

          <div>
            <label className="block font-medium">Zona Asignada</label>
            <input
              type="text"
              {...register("zona_asignada")}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="block font-medium">Rol</label>
            <select
              {...register("rol")}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            >
              <option value="tecnico">Técnico</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {usuarioActual && (
            <div>
              <label className="block font-medium">Activo</label>
              <select
                {...register("activo")}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          )}

          <div className="col-span-2 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors duration-300"
            >
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a] transition-colors duration-300">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
