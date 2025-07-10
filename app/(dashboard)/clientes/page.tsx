"use client";

import Swal from "sweetalert2";
import { Cliente } from "@prisma/client";
import ModalPago from "@/components/ModalPago";
import ModalCliente from "@/components/ModalCliente";
import { useEffect, useState, useCallback  } from "react";
import { Contact, Plus, Edit3, Trash2, DollarSign } from "lucide-react";

interface clienteActualizado {
  empresa: string,
  responsable: string,
  rtn: string,
  direccion: string,
  telefono: string,
  correo: string,
  activo: boolean,
  updateAt: string
}

interface ErrorDeValidacion {
  code: number;
  message?: string;
  results?: {
    campo: string;
    mensajes: string[];
  }[];
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// carga
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#295d0c] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Cargando clientes...</p>
  </div>
);

export default function ClientesPage() {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCliente, setIsCliente] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [modalPagoCliente, setModalPagoCliente] = useState<{ open: boolean; clienteId?: number }>({
    open: false,
  });

  // Estado para filtro
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroActual, setFiltroActual] = useState("");

  // Paginación estados - ahora manejados por el backend
  const [paginaActual, setPaginaActual] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({total: 0, page: 1, limit: 5, totalPages: 0});

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filtroNombre !== filtroActual) {
        setFiltroActual(filtroNombre);
        setPaginaActual(1); // Reset a página 1 cuando cambie el filtro
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [filtroNombre, filtroActual]);

  useEffect(() => {
    setIsCliente(true);
  }, []);

  // formatear teléfono
  const formatearTelefono = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const limitado = soloNumeros.slice(0, 8);

    if (limitado.length > 4) {
      return limitado.slice(0, 4) + "-" + limitado.slice(4);
    }

    return limitado;
  };

  const manejarCambioTelefono = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearTelefono(event.target.value);
    event.target.value = valorFormateado;
  };

  function mostrarErroresValidacion(data: ErrorDeValidacion) {

    if (data.code !== 200 && data.code !== 201 && data.results && data.results.length > 0) {
      const erroresHtml = data.results 
        .map((error) =>
            `<div class="mb-2"><ul class="ml-4 mt-1">${
              error.mensajes && Array.isArray(error.mensajes)
                ? error.mensajes.map((msg: string) => `<li>• ${msg}</li>`).join("")
                : "<li>Error inesperado!</li>"
            }</ul></div>`
        )
        .join("");

      Swal.fire({
        icon: "error",
        title: "Errores de validación",
        html: `<div class="text-left">${erroresHtml}</div>`,
        confirmButtonColor: "#295d0c",
        width: "500px",
      });

    } else {

      if (data.code !== 200 && data.code !== 201) {

        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error inesperado",
          confirmButtonColor: "#295d0c",
        });

      }

    }
  }

  // Obtener clientes desde la API con paginación
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setShowEmptyMessage(false);

    try {
      const params = new URLSearchParams({
        page: paginaActual.toString(),
        limit: meta.limit.toString(),
        ...(filtroActual && { search: filtroActual })
      });

      const res = await fetch(`/api/clientes?${params}`);
      const response = await res.json();

      if (response.code === 404) {

        setClientes([]);
        setMeta({
          total: 0,
          page: paginaActual,
          limit: meta.limit,
          totalPages: 0
        });

        setShowEmptyMessage(true);
        return;
      }

      if (!res.ok || response.code !== 200) {
        throw new Error(response.message || "Error al cargar clientes");
      }

      setClientes(response.results ?? []);
      
      if (response.meta) {
        setMeta(response.meta);
      }

      if (!response.results || response.results.length === 0) {
        setShowEmptyMessage(true);
      }

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error al cargar clientes",
        text: error instanceof Error ? error.message : "Error inesperado al cargar los clientes",
        confirmButtonColor: "#295d0c",
      });

    } finally {
      setLoading(false);
    }
  }, [paginaActual, filtroActual, meta.limit]);

  useEffect(() => {
    if (isCliente) {
      fetchClientes();
    }
  }, [fetchClientes, isCliente, paginaActual, filtroActual]);

  // Crear cliente
  async function handleSubmitCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const datosCliente = {
      empresa: formData.get("empresa") as string,
      responsable: formData.get("responsable") as string,
      rtn: formData.get("rtn") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      correo: formData.get("correo") as string,
      activo: true,
      horas_paquetes: 0,
      horas_individuales: 0,
      monto_individuales: 0,
      monto_paquetes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCliente),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Cliente creado!",
        text: data.message || "Cliente creado correctamente",
        confirmButtonColor: "#295d0c",
      });

      setPaginaActual(1); // Volver a página 1 al agregar
      fetchClientes();
      setModalOpen(false);

    } catch {

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });

    }
  }

  // Eliminar cliente
  async function handleEliminarCliente(id: number) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.code !== 200) {

        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error al eliminar cliente",
          confirmButtonColor: "#295d0c",
        });

        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Cliente eliminado!",
        text: data.message || "Cliente eliminado correctamente",
        confirmButtonColor: "#295d0c",
      });

      // Si quedamos en una página vacía, ir a la anterior
      if (clientes.length === 1 && paginaActual > 1) {
        setPaginaActual(paginaActual - 1);
      } else {
        fetchClientes();
      }

    } catch {

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });

    }
  }

  // Abrir modal para editar cliente
  function abrirEditarCliente(cliente: Cliente) {
    setClienteEditar(cliente);
    setModalOpen(true);
  }

  // Guardar cliente editado
  async function handleEditarCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clienteEditar) return;

    const formData = new FormData(event.currentTarget);
    const clienteActualizado: clienteActualizado = {
      empresa: formData.get("empresa") as string,
      responsable: formData.get("responsable") as string,
      rtn: formData.get("rtn") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      correo: formData.get("correo") as string,
      activo: formData.get("activo") === "true",
      updateAt: new Date().toISOString(),
    };

    const nuevoCorreo = formData.get("correo") as string;
    if (nuevoCorreo !== clienteEditar.correo) {
      clienteActualizado.correo = nuevoCorreo;
    }

    try {
      const res = await fetch(`/api/clientes/${clienteEditar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteActualizado),
      });

      const data = await res.json();

      if (!res.ok || (data.code !== 200 && data.code !== 201)) {
        mostrarErroresValidacion(data);
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Cliente actualizado!",
        text: data.message || "Cliente actualizado correctamente",
        confirmButtonColor: "#295d0c",
      });

      fetchClientes();
      setModalOpen(false);
      setClienteEditar(null);

    } catch {

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        confirmButtonColor: "#295d0c",
      });

    }
  }

  if (!isCliente) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 mb-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 flex border-b border-gray-300 pb-2 items-center gap-2 text-gray-800">
        <Contact className="w-7 h-7 text-[#295d0c]" />
        Gestión de Clientes
      </h1>

      {/* Input filtro */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 text-xs">
        <input
          type="text"
          placeholder="Buscar por empresa, RTN, responsable o correo..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
        />
        <button
          onClick={() => {
            setClienteEditar(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-[#295d0c] text-white px-3 py-2 xs:px-5 sm:py-3 rounded-md text-sm xs:text-base hover:bg-[#23480a] transition-colors duration-300 font-semibold shadow"
        >
          <Plus className="w-5 h-5" />
          Agregar Cliente
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : clientes.length === 0 && showEmptyMessage ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg">
            {filtroActual ? "No se encontraron clientes con ese criterio de búsqueda." : "No hay clientes registrados."}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {filtroActual ? "Intenta con otro término de búsqueda." : "Haz clic en 'Agregar Cliente' para comenzar."}
          </p>
        </div>
      ) : clientes.length > 0 ? (
        <>
          {/* Información de resultados */}
          <div className="mb-4 text-xs text-gray-600">
            Mostrando {clientes.length} de {meta.total} clientes
            {filtroActual && ` para "${filtroActual}"`}
          </div>
          <div className="-ml-4">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left">Empresa</th>
                <th className="px-2 sm:px-4 py-2 text-center">RTN/ID</th>
                <th className="px-2 sm:px-4 py-2 text-left hidden md:table-cell">Correo</th>
                <th className="px-2 sm:px-4 py-2 text-left hidden md:table-cell">Teléfono</th>
                <th className="px-2 sm:px-4 py-2 text-center">Activo</th>
                <th className="px-2 sm:px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-2">{cliente.empresa}</td>
                  <td className="px-2 sm:px-4 py-2">{cliente.rtn}</td>
                  <td className="px-2 sm:px-4 py-2 hidden md:table-cell">{cliente.correo}</td>
                  <td className="px-2 sm:px-4 py-2 hidden md:table-cell">{formatearTelefono(cliente.telefono)}</td>
                  <td className="px-2 sm:px-4 py-2 text-center">{cliente.activo ? "✅" : "❌"}</td>
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => abrirEditarCliente(cliente)}
                        className="mr-2 text-[#295d0c] hover:text-[#173a01]"
                      >
                        <Edit3 size={20}/>
                      </button>
                      <button
                        onClick={() => handleEliminarCliente(cliente.id)}
                        className="text-[#2e3763] hover:text-[#171f40]"
                      >
                        <Trash2 size={20}/>
                      </button>
                      <button
                        onClick={() => setModalPagoCliente({ open: true, clienteId: cliente.id })}
                        className="text-[#107c10] hover:text-[#0b5a0b]"
                        title="Agregar Pago"
                      >
                        <DollarSign size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Controles de paginación */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-600">
              Página {meta.page} de {meta.totalPages} ({meta.total} total)
            </div>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPaginaActual(1)}
                disabled={meta.page === 1}
                className="px-3 py-1 text-xs rounded border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Primera
              </button>
              <button
                onClick={() => setPaginaActual(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-3 py-1 rounded text-xs border border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 bg-[#295d0c] text-xs text-white rounded font-medium">
                {meta.page}
              </span>
              <button
                onClick={() => setPaginaActual(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="px-3 py-1 rounded border text-xs border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
              <button
                onClick={() => setPaginaActual(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
                className="px-3 py-1 rounded border text-xs border-gray-400 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Última
              </button>
            </div>
          </div>
        </>
      ) : null}

      <ModalCliente
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClienteEditar(null);
        }}
      >
        <h2 className="text-lg font-semibold mb-6 text-gray-900">{clienteEditar ? "Editar Cliente" : "Nuevo Cliente"}</h2>
        <form onSubmit={clienteEditar ? handleEditarCliente : handleSubmitCliente} className="space-y-4">
          {[
            { label: "Empresa", name: "empresa", type: "text", placeholder: "Nombre de la empresa" },
            { label: "Responsable", name: "responsable", type: "text", placeholder: "Responsable" },
            { label: "RTN/ID", name: "rtn", type: "text", placeholder: "RTN/ID" },
            { label: "Direccion", name: "direccion", type: "text", placeholder: "Direccion" },
            //{ label: "Correo", name: "correo", type: "email", placeholder: "Correo" },
          ].map(({ label, name, type, placeholder }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium text-xs">
              <span className="text-gray-700">
                {label}: <span className="text-red-500 font-bold">*</span>
              </span>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={clienteEditar ? (clienteEditar as any)[name] : ""}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              />
            </label>
          ))}
          <label className="block mb-4 text-gray-800 font-medium text-xs">
            <span className="text-gray-700">Correo:</span>
            <input
              name="correo"
              type="email"
              placeholder="Correo"
              defaultValue={clienteEditar ? clienteEditar.correo : ""}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

          <label className="block mb-4 text-gray-800 font-medium text-xs">
            Teléfono: <span className="text-red-500 font-bold">*</span>
            <input
              name="telefono"
              type="tel"
              placeholder="Número telefónico"
              defaultValue={clienteEditar ? formatearTelefono(clienteEditar.telefono) : ""}
              onChange={manejarCambioTelefono}
              maxLength={9}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
            />
          </label>

          {clienteEditar && (
            <label className="block mb-4 text-gray-800 font-medium">
              <span className="text-gray-700">Estado:</span>
              <select
                name="activo"
                defaultValue={clienteEditar.activo ? "true" : "false"}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#295d0c]"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          )}
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 text-sm rounded-md bg-red-700 text-white font-semibold hover:bg-red-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-md bg-[#295d0c] text-white font-semibold hover:bg-[#23480a]"
            >
              {clienteEditar ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </ModalCliente>
      {modalPagoCliente.open && modalPagoCliente.clienteId && (
      <ModalPago
        clienteId={modalPagoCliente.clienteId}
        onClose={() => setModalPagoCliente({ open: false })}
        onGuardar={fetchClientes}
      />
    )}
    </div>
  );
}
