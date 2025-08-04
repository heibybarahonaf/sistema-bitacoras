"use client";

import Swal from "sweetalert2";
import { Cliente } from "@prisma/client";
import ModalPago from "@/components/ModalPago";
import ModalCliente from "@/components/ModalCliente";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState, useCallback  } from "react";
import PaginationButtons from "@/components/PaginationButtons";
import { TableHeader, TableCell } from "@/components/TableComponents";
import { Contact, Plus, Edit3, Trash2, DollarSign } from "lucide-react";

interface clienteActualizado {
  empresa: string,
  responsable: string,
  rtn: string,
  direccion: string,
  telefono: string,
  correo: string | null;
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

export default function ClientesPage() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCliente, setIsCliente] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
  const [modalPagoCliente, setModalPagoCliente] = useState<{ open: boolean; clienteId?: number }>({ open: false });

  // Estado para filtro
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroActual, setFiltroActual] = useState("");

  // Paginación estados - ahora manejados por el backend
  const [paginaActual, setPaginaActual] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({total: 0, page: 1, limit: 10, totalPages: 0});

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filtroNombre !== filtroActual) {
        setFiltroActual(filtroNombre);
        setPaginaActual(1); 
      }
    }, 1500); // 500ms de debounce

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
    setCreating(true);

    const formData = new FormData(event.currentTarget);
    const correo = (formData.get("correo") as string)?.trim();

    const datosCliente = {
      empresa: formData.get("empresa") as string,
      responsable: formData.get("responsable") as string,
      rtn: formData.get("rtn") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      correo: correo === "" ? null : correo,
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

    } finally {
      setCreating(false);
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
    setCreating(true);

    const formData = new FormData(event.currentTarget);
    const nuevoCorreoRaw = (formData.get("correo") as string)?.trim();
    const nuevoCorreo = nuevoCorreoRaw === "" ? null : nuevoCorreoRaw;

    const clienteActualizado: clienteActualizado = {
      empresa: formData.get("empresa") as string,
      responsable: formData.get("responsable") as string,
      rtn: formData.get("rtn") as string,
      direccion: formData.get("direccion") as string,
      telefono: formData.get("telefono") as string,
      correo: nuevoCorreo,
      activo: formData.get("activo") === "true",
      updateAt: new Date().toISOString(),
    };

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

    } finally{
      setCreating(false);
    }
  }

  if (!isCliente) {
    return <LoadingSpinner mensaje="Cargando clientes..."/>;
  }

  return (
    <div className="w-full p-6 pb-20 min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-2">
          <Contact className="w-6 h-6 text-emerald-700" />
          Gestión de Clientes
        </h1>
        <div className="border-b border-gray-200"></div>
      </div>

      {/* Búsqueda y botón agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar por Empresa o RTN/ID"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            setClienteEditar(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Cliente
        </button>
      </div>

      {loading ? (
        <LoadingSpinner mensaje="Cargando clientes..."/>
      ) : clientes.length === 0 && showEmptyMessage ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <p className="text-gray-600 text-lg">
            {filtroActual ? "No se encontraron clientes con ese criterio de búsqueda." : "No hay clientes registrados."}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {filtroActual ? "Intenta con otro término de búsqueda." : "Haz clic en 'Agregar Cliente' para comenzar."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>Empresa</TableHeader>
                  <TableHeader>RTN/ID</TableHeader>
                  <TableHeader className="hidden md:table-cell">Correo</TableHeader>
                  <TableHeader className="hidden md:table-cell">Teléfono</TableHeader>
                  <TableHeader>Estado</TableHeader>
                  <TableHeader>Acciones</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>{cliente.empresa}</TableCell>
                    <TableCell>{cliente.rtn}</TableCell>
                    <TableCell className="hidden md:table-cell">{cliente.correo || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatearTelefono(cliente.telefono)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cliente.activo 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => abrirEditarCliente(cliente)}
                          className="text-gray-600 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-emerald-50"
                          title="Editar"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminarCliente(cliente.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setModalPagoCliente({ open: true, clienteId: cliente.id })}
                          className="text-gray-600 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                          title="Agregar Pago"
                        >
                          <DollarSign className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>

              {/* Pie de tabla con paginación */}
              {meta.totalPages > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-gray-600">
                          Página {meta.page} de {meta.totalPages} ({meta.total} total)
                        </div>
                        <div className="flex space-x-1">
                          <PaginationButtons
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            onPageChange={setPaginaActual}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}

            </table>
          </div>
        </div>
      )}

      <ModalCliente
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClienteEditar(null);
        }}
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-900">{clienteEditar ? "Editar Cliente" : "Nuevo Cliente"}</h2>
        <form onSubmit={clienteEditar ? handleEditarCliente : handleSubmitCliente} className="space-y-4">
          {[
            { label: "Empresa", name: "empresa", type: "text", placeholder: "Nombre de la empresa" },
            { label: "Responsable", name: "responsable", type: "text", placeholder: "Responsable" },
            { label: "RTN/ID", name: "rtn", type: "text", placeholder: "RTN/ID" },
            { label: "Zona", name: "direccion", type: "text", placeholder: "Zona" },
          ].map(({ label, name, type, placeholder }) => (
            <label key={name} className="block mb-4 text-gray-800 font-medium text-sm">
              <span className="text-gray-700">
                {label}: <span className="text-red-500">*</span>
              </span>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={clienteEditar ? (clienteEditar as any)[name] : ""}
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>
          ))}
          
          <label className="block mb-4 text-gray-800 font-medium text-sm">
            <span className="text-gray-700">Correo:</span>
            <input
              name="correo"
              type="email"
              placeholder="Correo"
              defaultValue={clienteEditar ? (clienteEditar.correo ?? "") : ""}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </label>

          <label className="block mb-4 text-gray-800 font-medium text-sm">
            <span className="text-gray-700">
              Teléfono: <span className="text-red-500">*</span>
            </span>
            <input
              name="telefono"
              type="tel"
              placeholder="Número telefónico"
              defaultValue={clienteEditar ? formatearTelefono(clienteEditar.telefono) : ""}
              onChange={manejarCambioTelefono}
              maxLength={9}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </label>

          {clienteEditar && (
            <label className="block mb-4 text-gray-800 font-medium text-sm">
              <span className="text-gray-700">Estado:</span>
              <select
                name="activo"
                defaultValue={clienteEditar.activo ? "true" : "false"}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </label>
          )}
          
          <div className="mt-6 text-sm flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 rounded-md bg-red-700 text-white font-semibold hover:bg-red-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className={`px-6 py-2 rounded-md font-semibold transition bg-[#295d0c] text-white hover:bg-[#23480a]
                ${creating ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {creating
                ? clienteEditar
                  ? "Guardando..."
                  : "Guardando..."
                : clienteEditar
                ? "Guardar"
                : "Guardar"}
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
