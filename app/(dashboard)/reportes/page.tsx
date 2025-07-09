"use client";

import Swal from "sweetalert2";
import { useState } from "react";
import { Cliente } from "@prisma/client";
import { BarChart, X } from "lucide-react";
import CardReporte from "../../../components/CardReporte";

interface BitacoraData {
  id: number;
  fecha: string;
  ticket: string;
  cliente: string;
  tecnico: string;
  hora_llegada: string;
  hora_salida: string;
  horas: string;
  servicio: string;
  modalidad: string;
  tipo_horas: string;
  monto: string;
  porcentaje_comision: number;
  comision: string;
  descripcion: string;
  venta: string;
}

export default function ReportesPage() {

  const [isGenerating, setIsGenerating] = useState({
    general: false,
    cliente: false,
    usuario: false,
    ventas: false,
  });

  const [modalPreview, setModalPreview] = useState({
    isOpen: false,
    tipo: "" as "general" | "cliente" | "usuario" | "ventas",
    data: [] as BitacoraData[],
    loading: false,
    fechaInicio: "",
    fechaFinal: "",
    filtroNombre: "",
    rtnCliente: "",
    nombreCliente: "",
  });

  const [activeTab, setActiveTab] = useState<"general" | "cliente" | "usuario" | "ventas">("general");

  // --- Alertas ---
  const mostrarAlertaError = (mensaje: string) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: mensaje,
      confirmButtonColor: "#dc2626",
    });
  };

  const mostrarAlertaExito = (mensaje: string) => {
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: mensaje,
      confirmButtonColor: "#16a34a",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  const mostrarAlertaAdvertencia = (mensaje: string) => {
    Swal.fire({
      icon: "warning",
      title: "Advertencia",
      text: mensaje,
      confirmButtonColor: "#16a34a",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  // --- Formateos ---
  const formatearFecha = (fecha: string) => {
    if (!fecha) return "";
    const d = new Date(fecha);

    if (isNaN(d.getTime())) return "Fecha inválida";

    const dia = d.getUTCDate().toString().padStart(2, "0");
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const año = d.getUTCFullYear();

    return `${dia}/${mes}/${año}`;
  };

  const formatearHora = (hora: string) => {
    if (!hora) return "";
    const d = new Date(hora);
    const horas = d.getHours().toString().padStart(2, "0");
    const minutos = d.getMinutes().toString().padStart(2, "0");

    return `${horas}:${minutos}`;
  };

  // --- Función para buscar clientes (usada en modal) ---
  const buscarClientes = async (termino: string): Promise<Cliente[]> => {

    try {

      const res = await fetch(`/api/clientes?search=${encodeURIComponent(termino)}&limit=5`);
      if (!res.ok) throw new Error("Error en la búsqueda");

      const data = await res.json();
      return data.results || [];

    } catch (error) {

      mostrarAlertaError("Error al buscar clientes");
      return [];

    }
  };

  // --- Modal para búsqueda y selección de cliente ---
  const mostrarModalBusquedaClientes = async (): Promise<Cliente | null> => {
    const { value: selectedCliente } = await Swal.fire({
      title: "Buscar Cliente",
      width: "800px",
      html: `
        <div class="mb-4">
          <input 
            type="text" 
            id="buscar-cliente-input"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#295d0c] focus:border-transparent"
            placeholder="Buscar por nombre o RTN..."
          />
        </div>
        <div class="max-h-96 overflow-y-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RTN</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody id="clientes-resultados" class="bg-white divide-y divide-gray-200">
              <tr>
                <td colspan="4" class="px-4 py-4 text-center text-gray-500">
                  Ingrese un término de búsqueda
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#295d0c",
      preConfirm: () => {
        const selected = document.querySelector(".cliente-seleccionado");
        if (!selected) {
          Swal.showValidationMessage("Debe seleccionar un cliente");
          return null;
        }

        const clienteData = selected.getAttribute("data-cliente");
        if (!clienteData) {
          Swal.showValidationMessage("Datos del cliente no válidos");
          return null;
        }

        try {
          return JSON.parse(clienteData) as Cliente;
        } catch {
          Swal.showValidationMessage("Error al procesar datos del cliente");
          return null;
        }

      },
      didOpen: () => {
        const input = document.getElementById("buscar-cliente-input");
        const resultados = document.getElementById("clientes-resultados");

        if (!input || !resultados) return;

        input.addEventListener("input", async (e) => {
          const target = e.target as HTMLInputElement;
          const termino = target.value.trim();

          if (termino.length < 2) {
            resultados.innerHTML = `
              <tr>
                <td colspan="4" class="px-4 py-4 text-center text-gray-500">
                  Ingrese al menos 2 caracteres
                </td>
              </tr>
            `;
            return;
          }

          resultados.innerHTML = `
            <tr>
              <td colspan="4" class="px-4 py-4 text-center text-gray-500">
                Buscando clientes...
              </td>
            </tr>
          `;

          const clientes = await buscarClientes(termino);

          if (clientes.length === 0) {
            resultados.innerHTML = `
              <tr>
                <td colspan="4" class="px-4 py-4 text-center text-gray-500">
                  No se encontraron clientes
                </td>
              </tr>
            `;
            return;
          }

          resultados.innerHTML = clientes
            .map(
              (cliente) => `
            <tr class="cliente-seleccionado hover:bg-gray-50 cursor-pointer" 
                data-cliente='${JSON.stringify(cliente)}'>
              <td class="px-4 py-4 whitespace-nowrap">${cliente.empresa}</td>
              <td class="px-4 py-4 whitespace-nowrap">${cliente.rtn}</td>
              <td class="px-4 py-4 whitespace-nowrap">${cliente.telefono}</td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                  cliente.activo
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }">
                  ${cliente.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          `
            )
            .join("");

          document.querySelectorAll(".cliente-seleccionado").forEach((fila) => {
            fila.addEventListener("click", () => {
              document
                .querySelectorAll(".cliente-seleccionado")
                .forEach((f) => {
                  f.classList.remove("bg-blue-50");
                });
              fila.classList.add("bg-blue-50");
            });
          });
        });
      },
    });

    return selectedCliente as Cliente | null;
  };

  // --- Función para generar reporte y descargar PDF ---
  const generarReporte = async (
    tipo: "general" | "cliente" | "usuario" | "ventas",
    fechaInicio: string,
    fechaFinal: string,
    nombre?: string,
    rtn?: string,
    usuario?: string
  ) => {

    if (!fechaInicio || !fechaFinal) {
      mostrarAlertaError("Ingresa ambas fechas");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFinal)) {
      mostrarAlertaError(
        "La fecha de inicio no puede ser mayor que la fecha final"
      );
      return;
    }

    if (tipo == "usuario" && !nombre) {
      mostrarAlertaError(`Selecciona el Nombre del técnico`);
      return;
    }

    if (tipo == "ventas" && !usuario) {
      mostrarAlertaError(`Selecciona el Nombre del técnico`);
      return;
    }

    if (tipo == "cliente" && !rtn) {
      const cliente = await mostrarModalBusquedaClientes();
      if (!cliente) return;
      rtn = cliente.rtn;
    }

    setIsGenerating((prev) => ({ ...prev, [tipo]: true }));

    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFinal,
      });

      if (tipo == "usuario" && nombre) {
        params.append("nombre", nombre);
      } else if (tipo == "cliente" && rtn) {
        params.append("RTN", rtn);
      } else if (tipo == "ventas" && usuario) {
        params.append("usuario", usuario);
      }

      const response = await fetch(
        `/api/reportes/${tipo}-bitacoras?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
          },
        }
      );


      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/pdf")) {
          mostrarAlertaError("El servidor no devolvió un PDF válido");
          return;
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          mostrarAlertaError("El PDF generado está vacío");
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bitacoras_${tipo}_${fechaInicio}_${fechaFinal}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        mostrarAlertaExito("PDF descargado exitosamente");
      } else {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: "Error interno del servidor" };
        }

        mostrarAlertaAdvertencia(
          errorData.message || "Error al generar el reporte"
        );
      }
    } catch {
      mostrarAlertaError("Error de conexión al generar el reporte");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  // --- Función para previsualizar reporte ---
  const previsualizarReporte = async (
    tipo: "general" | "cliente" | "usuario" | "ventas",
    fechaInicio: string,
    fechaFinal: string,
    id?: string,
    rtn?: string,
    usuario?: string
  ) => {
    if (!fechaInicio || !fechaFinal) {
      mostrarAlertaError("Ingresa las fechas para ver la vista previa");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFinal)) {

      mostrarAlertaError(
        "La fecha de inicio no puede ser mayor que la fecha final"
      );

      return;
    }

    if (tipo === "cliente" && !rtn) {
      const cliente = await mostrarModalBusquedaClientes();
      if (!cliente) return;
      rtn = cliente.rtn;
    }

    if (tipo === "usuario" && !id) {
      mostrarAlertaError("Nombre requerido para vista previa por técnico");
      return;
    }

    if (tipo === "ventas" && !usuario) {
      mostrarAlertaError("Nombre requerido para vista previa por técnico");
      return;
    }

    setModalPreview({
      isOpen: true,
      tipo,
      data: [],
      loading: true,
      fechaInicio,
      fechaFinal,
      filtroNombre:
        tipo === "cliente"
          ? `Cliente RTN: ${rtn}`
          : tipo === "usuario"
          ? `Técnico: ${id}`
          : tipo === "ventas"
          ? `Técnico: ${usuario}`
          : "Reporte General",
      rtnCliente: tipo === "cliente" ? rtn || "" : "",
      nombreCliente: "",
    });

    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFinal,
      });

      if (tipo === "usuario" && id) {
        params.append("nombre", id);
      } else if (tipo === "cliente" && rtn) {
        params.append("RTN", rtn);
      } else if (tipo === "ventas" && usuario) {
        params.append("usuario", usuario);
      }


      const response = await fetch(
        `/api/reportes/${tipo}-bitacoras/previsualizacion?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      if (response.ok) {
        const result = await response.json();
        const data = result.results?.[0] || [];

        setModalPreview((prev) => ({
          ...prev,
          loading: false,
          data: data,
          nombreCliente: data.length > 0 ? data[0].cliente : "",
        }));
        
      } else {
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: "Error interno del servidor" };
        }


        mostrarAlertaAdvertencia(
          errorData.message || "Error al cargar la vista previa"
        );

        setModalPreview((prev) => ({ ...prev, isOpen: false, loading: false }));
      }
    } catch (error) {
      mostrarAlertaError("Error de conexión al cargar la vista previa");
      setModalPreview((prev) => ({ ...prev, isOpen: false, loading: false }));
    }
  };

  const cerrarModal = () => {
    setModalPreview({
      isOpen: false,
      tipo: "general",
      data: [],
      loading: false,
      fechaInicio: "",
      fechaFinal: "",
      filtroNombre: "",
      rtnCliente: "",
      nombreCliente: "",
    });
  };

  const reportes = [
    { tipo: "general" as const, title: "Reporte General" },
    { tipo: "cliente" as const, title: "Reporte por Cliente" },
    { tipo: "usuario" as const, title: "Reporte Comisiones" },
    { tipo: "ventas" as const, title: "Reporte Ventas" },
  ];

  return (
    <div className="p-6 mb-6">
      <h1 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300 tracking-wide text-gray-800 flex items-center gap-3">
        <BarChart className="w-8 h-8 text-[#295d0c]" />
        Gestión de Reportes
      </h1>

      {/* Menú de pestañas */}
      <div className="flex border-b border-gray-300 mb-6">
        {reportes.map(({ tipo, title }) => (
          <button
            key={tipo}
            className={`py-2 px-6 -mb-px border-b-2 font-medium text-sm

            ${
              activeTab === tipo
                ? "border-[#295d0c] text-[#295d0c]"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
            }
            transition-colors duration-200`}

            onClick={() => setActiveTab(tipo)}
            type="button"
          >
            {title}
          </button>
        ))}
      </div>

      {/* Mostrar solo el CardReporte de la pestaña activa */}
      <div className="max-w-3xl mx-auto">
        {reportes
          .filter(({ tipo }) => tipo === activeTab)
          .map(({ tipo, title }) => (
            <CardReporte
              key={tipo}
              tipo={tipo}
              title={title}
              isGenerating={isGenerating[tipo]}
              onGenerate={generarReporte}
              onPreview={previsualizarReporte}
            />
          ))}
      </div>

      {/* Modal de Vista Previa */}
      {modalPreview.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Vista Previa del Reporte
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {modalPreview.tipo === "cliente"
                    ? `RTN: ${modalPreview.rtnCliente} - Cliente: ${modalPreview.nombreCliente}`
                    : modalPreview.tipo === "usuario"

                    ? `Técnico: ${
                        modalPreview.filtroNombre.split("Técnico: ")[1] ||
                        modalPreview.filtroNombre
                      }`
                    : modalPreview.tipo === "ventas"
                    ? `Técnico: ${
                        modalPreview.filtroNombre.split("Técnico: ")[1] ||
                        modalPreview.filtroNombre
                      }`
                    : "Reporte General"}{" "}
                  • {formatearFecha(modalPreview.fechaInicio)} al{" "}
                  {formatearFecha(modalPreview.fechaFinal)}

                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {modalPreview.loading ? (

                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">
                    Cargando vista previa...
                  </span>
                </div>
              ) : modalPreview.data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No se encontraron bitácoras para el rango de fechas
                    especificado
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {modalPreview.tipo === "ventas" ? (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                              Bitacora
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                              Cliente
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ventas
                            </th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ticket
                            </th>
                            {modalPreview.tipo === "general" && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                  Cliente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Técnico
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Llegada
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Salida
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tipo Horas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Servicio
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Modalidad
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                                  Descripción
                                </th>
                              </>
                            )}
                            {modalPreview.tipo === "cliente" && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Técnico
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Horas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tipo Horas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Servicio
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Modalidad
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                                  Descripción
                                </th>
                              </>
                            )}
                            {modalPreview.tipo === "usuario" && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                  Bitacora #
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                  Cliente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Horas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                  Tipo Horas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                  Monto
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                  % Comisión
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Comisión
                                </th>
                              </>
                            )}
                          </>
                        )}
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalPreview.data.map((bitacora, index) => {
                        if (modalPreview.tipo === "ventas") {
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatearFecha(bitacora.fecha)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {bitacora.id}
                              </td>
                              <td
                                className="px-4 py-4 text-sm text-gray-900 max-w-32 truncate"
                                title={bitacora.cliente}
                              >
                                {bitacora.cliente}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {bitacora.venta}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatearFecha(bitacora.fecha)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {bitacora.ticket}
                            </td>
                            {modalPreview.tipo === "general" && (
                              <>
                                <td
                                  className="px-4 py-4 text-sm text-gray-900 max-w-32 truncate"
                                  title={bitacora.cliente}
                                >
                                  {bitacora.cliente}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.tecnico}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatearHora(bitacora.hora_llegada)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatearHora(bitacora.hora_salida)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.tipo_horas}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.servicio}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.modalidad}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-pre-line max-w-80 break-words">
                                  {bitacora.descripcion}
                                </td>
                              </>
                            )}

                            {modalPreview.tipo === "cliente" && (
                              <>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.tecnico}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatearHora(bitacora.horas)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.tipo_horas}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.servicio}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.modalidad}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-pre-line max-w-80 break-words">
                                  {bitacora.descripcion}
                                </td>
                              </>
                            )}
                            
                            {modalPreview.tipo === "usuario" && (
                              <>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.id}
                                </td>
                                <td
                                  className="px-4 py-4 text-sm text-gray-900 max-w-32 truncate"
                                  title={bitacora.cliente}
                                >
                                  {bitacora.cliente}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.horas}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.tipo_horas}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.monto}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {bitacora.porcentaje_comision}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {parseFloat(bitacora.comision).toFixed(2)}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!modalPreview.loading && modalPreview.data.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 gap-2 text-sm text-gray-600">
                <p>Total de registros: {modalPreview.data.length}</p>

                {modalPreview.tipo === "usuario" &&
                  (() => {
                    const totalMontos = modalPreview.data.reduce(
                      (sum, item) => sum + parseFloat(item.monto || "0"),
                      0
                    );
                    const totalComisiones = modalPreview.data.reduce(
                      (sum, item) => sum + parseFloat(item.comision || "0"),
                      0
                    );

                    return (
                      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        <span className="font-medium">Total Monto: </span> L.{" "}
                        {totalMontos.toFixed(2)}
                        <span className="font-medium">
                          Total Comisión:{" "}
                        </span> L. {totalComisiones.toFixed(2)}
                      </div>
                    );
                  })()}

                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
